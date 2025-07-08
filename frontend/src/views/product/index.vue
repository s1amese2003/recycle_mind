<template>
  <div class="product-manage-container" :class="theme">
    <el-card>
      <div class="toolbar">
        <!-- 分类选择 -->
        <el-select v-model="selectedCategory" placeholder="全部分类" style="width: 120px; margin-right: 10px;">
          <el-option label="全部分类" value="" />
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
        <el-select v-model="currentRole" style="width: 120px; margin-right: 10px;">
          <el-option label="管理员" value="admin" />
          <el-option label="操作员" value="operator" />
          <el-option label="只读" value="viewer" />
        </el-select>
        <el-button v-if="can('add')" type="primary" @click="openAddDialog">添加产品</el-button>
        <el-button v-if="can('export')" type="success" @click="exportExcel">导出Excel</el-button>
        <el-upload
          v-if="can('import')"
          :show-file-list="false"
          :before-upload="importExcel"
          accept=".xlsx,.xls"
        >
          <el-button type="info">导入Excel</el-button>
        </el-upload>
        <el-button v-if="can('delete')" type="danger" :disabled="!multipleSelection.length" @click="batchDelete">批量删除</el-button>
        <el-input v-model="searchName" placeholder="搜索产品名称" style="width: 200px; margin-left: 10px;" clearable @input="filterProducts" />
        <el-dropdown style="margin-left: 10px;">
          <el-button type="primary">自定义列<i class="el-icon-arrow-down el-icon--right"></i></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="metal in metals" :key="metal" @click.native.stop>
              <el-checkbox v-model="visibleMetals[metal]">{{ metal }}</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button @click="loadProducts">刷新</el-button>
        <el-switch
          v-model="themeDark"
          active-text="暗黑模式"
          inactive-text="明亮模式"
          style="margin-left: 20px;"
          @change="toggleTheme"
        />
      </div>
      <div style="overflow-x: auto;">
        <el-table
          :data="pagedProducts"
          style="width: 100%; min-width: 1200px;"
          stripe
          @selection-change="handleSelectionChange"
          :default-sort="{prop: sortProp, order: sortOrder}"
          @sort-change="handleSortChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="50" v-if="can('delete')" />
          <el-table-column prop="name" label="产品名称" width="120" sortable="custom" />
          <el-table-column
            v-for="metal in metals"
            v-if="visibleMetals[metal]"
            :key="metal"
            :label="metal"
            min-width="120"
            sortable="custom"
          >
            <template #default="scope">
              <span>{{ scope.row[metal].min }}% ~ {{ scope.row[metal].max }}%</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="scope">
              <el-button v-if="can('edit')" size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
              <el-button v-if="can('delete')" size="mini" type="danger" @click="deleteProduct(scope.row)">删除</el-button>
              <el-dropdown v-if="productHistory[scope.row.name] && productHistory[scope.row.name].length" style="margin-left: 8px;">
                <el-button size="mini">历史版本</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(ver, idx) in productHistory[scope.row.name]" :key="idx" @click.native="revertProduct(scope.row.name, idx)">
                    {{ ver.time }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination
        style="margin-top: 16px; text-align: right;"
        background
        layout="prev, pager, next, jumper, ->, total"
        :total="filteredProducts.length"
        :page-size="pageSize"
        :current-page.sync="currentPage"
        @current-change="handlePageChange"
      />
    </el-card>
    <product-edit-dialog
      v-if="editDialogVisible"
      :visible.sync="editDialogVisible"
      :product="editProduct"
      :is-add="isAdd"
      :metals="metals"
      :categories="categories"
      @save="saveProduct"
      @validate="validateComposition"
    />
    <el-card style="margin-top: 24px;">
      <div style="font-weight: bold; margin-bottom: 8px;">操作日志</div>
      <el-table :data="logs" size="mini" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="action" label="操作" width="120" />
        <el-table-column prop="detail" label="详情" />
      </el-table>
    </el-card>
    <el-card style="margin-top: 24px;">
      <div style="font-weight: bold; margin-bottom: 8px;">产品成分分布图</div>
      <div id="product-chart" class="product-chart-area"></div>
    </el-card>
    <el-button
      v-if="undoStack.length"
      type="warning"
      style="position: fixed; right: 32px; bottom: 32px; z-index: 9999;"
      @click="undo"
    >撤销上一步操作</el-button>
  </div>
</template>

<script>
import ProductEditDialog from '@/components/ProductEditDialog.vue'
import XLSX from 'xlsx'
import * as echarts from 'echarts'

const defaultMetals = [
  'Si', 'Fe', 'Cu', 'Mn', 'Mg', 'Zn', 'Ti', 'Cr', 'Ni', 'Zr', 'Sr', 'Bi', 'Na', 'Al'
]

const rolePermissions = {
  admin: ['add', 'edit', 'delete', 'export', 'import'],
  operator: ['add', 'edit', 'export', 'import'],
  viewer: []
}

export default {
  name: 'ProductManage',
  components: { ProductEditDialog },
  data() {
    const visibleMetals = {}
    defaultMetals.forEach(m => (visibleMetals[m] = true))
    return {
      metals: defaultMetals,
      visibleMetals,
      products: [],
      editDialogVisible: false,
      editProduct: null,
      isAdd: false,
      multipleSelection: [],
      searchName: '',
      filteredProducts: [],
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      logs: [],
      themeDark: false,
      selectedProduct: null,
      currentRole: 'admin',
      undoStack: [],
      categories: ['铝合金', '铜合金', '钢铁'],
      selectedCategory: '',
      productHistory: {} // 历史版本记录
    }
  },
  computed: {
    pagedProducts() {
      let list = this.filteredProducts
      if (this.selectedCategory) {
        list = list.filter(p => p.category === this.selectedCategory)
      }
      const start = (this.currentPage - 1) * this.pageSize
      return list.slice(start, start + this.pageSize)
    },
    theme() {
      return this.themeDark ? 'theme-dark' : 'theme-light'
    }
  },
  created() {
    // 优先从localStorage加载产品数据
    const local = localStorage.getItem('products')
    if (local) {
      this.products = JSON.parse(local)
    } else {
      this.products = [
        {
          name: '产品A',
          category: '铝合金',
          Si: { min: 0.1, max: 0.3 }, Fe: { min: 0.2, max: 0.5 }, Cu: { min: 0, max: 0.1 }, Mn: { min: 0, max: 0.2 }, Mg: { min: 0.3, max: 0.6 },
          Zn: { min: 0, max: 0.1 }, Ti: { min: 0, max: 0.05 }, Cr: { min: 0, max: 0.05 }, Ni: { min: 0, max: 0.05 }, Zr: { min: 0, max: 0.05 },
          Sr: { min: 0, max: 0.05 }, Bi: { min: 0, max: 0.05 }, Na: { min: 0, max: 0.05 }, Al: { min: 98, max: 99.5 }
        },
        {
          name: '产品B',
          category: '铝合金',
          Si: { min: 0.2, max: 0.4 }, Fe: { min: 0.1, max: 0.3 }, Cu: { min: 0, max: 0.1 }, Mn: { min: 0, max: 0.2 }, Mg: { min: 0.2, max: 0.5 },
          Zn: { min: 0, max: 0.1 }, Ti: { min: 0, max: 0.05 }, Cr: { min: 0, max: 0.05 }, Ni: { min: 0, max: 0.05 }, Zr: { min: 0, max: 0.05 },
          Sr: { min: 0, max: 0.05 }, Bi: { min: 0, max: 0.05 }, Na: { min: 0, max: 0.05 }, Al: { min: 97, max: 99 }
        }
      ]
    }
    this.filteredProducts = this.products.slice()
    this.selectedProduct = this.products[0]
  },
  mounted() {
    this.$nextTick(this.renderChart)
  },
  watch: {
    products: {
      handler(val) {
        localStorage.setItem('products', JSON.stringify(val))
      },
      deep: true
    },
    selectedProduct() {
      this.$nextTick(this.renderChart)
    },
    themeDark() {
      this.$nextTick(this.renderChart)
    }
  },
  methods: {
    can(action) {
      return rolePermissions[this.currentRole].includes(action)
    },
    toggleTheme() {
      document.body.className = this.themeDark ? 'theme-dark' : ''
    },
    handleRowClick(row) {
      this.selectedProduct = row
    },
    renderChart() {
      if (!this.selectedProduct) return
      const chartDom = document.getElementById('product-chart')
      if (!chartDom) return
      const metals = this.metals.filter(m => this.visibleMetals[m])
      const values = metals.map(m => this.selectedProduct[m].max)
      const isDark = this.themeDark
      const option = {
        backgroundColor: isDark ? '#181c27' : '#fff',
        title: {
          text: this.selectedProduct.name + ' 各成分最大含量',
          left: 'center',
          textStyle: { color: isDark ? '#fff' : '#333', fontSize: 18 }
        },
        tooltip: {},
        grid: { left: 40, right: 40, top: 60, bottom: 40 },
        xAxis: {
          data: metals,
          axisLabel: { color: isDark ? '#fff' : '#333', fontSize: 14 },
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#333' } },
          axisTick: { show: false }
        },
        yAxis: {
          axisLabel: { color: isDark ? '#fff' : '#333', fontSize: 14 },
          axisLine: { lineStyle: { color: isDark ? '#aaa' : '#333' } },
          splitLine: { lineStyle: { color: isDark ? '#333c4d' : '#eee' } }
        },
        series: [{
          type: 'bar',
          data: values,
          itemStyle: {
            color: isDark ? '#4fd2dd' : '#409EFF',
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: 32
        }]
      }
      if (!this._chart) {
        this._chart = echarts.init(chartDom)
      }
      this._chart.setOption(option)
      this._chart.resize()
    },
    log(action, detail) {
      this.logs.unshift({
        time: new Date().toLocaleString(),
        action,
        detail
      })
    },
    loadProducts() {
      this.$message.success('产品数据已刷新（mock）')
      this.filterProducts()
      this.log('刷新', '刷新产品数据')
    },
    openAddDialog() {
      const product = { name: '', category: this.categories[0] }
      this.metals.forEach(metal => {
        product[metal] = { min: 0, max: 0 }
      })
      this.editProduct = product
      this.isAdd = true
      this.editDialogVisible = true
    },
    openEditDialog(product) {
      this.editProduct = JSON.parse(JSON.stringify(product))
      this.isAdd = false
      this.editDialogVisible = true
    },
    saveProduct(product) {
      // 历史版本记录
      if (!this.productHistory[product.name]) this.productHistory[product.name] = []
      this.productHistory[product.name].unshift({
        ...JSON.parse(JSON.stringify(product)),
        time: new Date().toLocaleString()
      })
      const prev = JSON.parse(JSON.stringify(this.products))
      if (this.isAdd) {
        this.products.push(product)
        this.$message.success('添加产品成功')
        this.log('添加', `添加产品：${product.name}`)
        this.undoStack.unshift({ type: 'add', prev })
      } else {
        const idx = this.products.findIndex(p => p.name === product.name)
        if (idx !== -1) {
          this.products.splice(idx, 1, product)
          this.$message.success('编辑产品成功')
          this.log('编辑', `编辑产品：${product.name}`)
          this.undoStack.unshift({ type: 'edit', prev })
        }
      }
      this.filterProducts()
      this.editDialogVisible = false
      this.selectedProduct = this.products[0]
      this.$nextTick(this.renderChart)
    },
    deleteProduct(product) {
      this.$confirm(`确定要删除产品 ${product.name} 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        const prev = JSON.parse(JSON.stringify(this.products))
        this.products = this.products.filter(p => p.name !== product.name)
        this.filterProducts()
        this.$message.success('删除产品成功')
        this.log('删除', `删除产品：${product.name}`)
        this.undoStack.unshift({ type: 'delete', prev })
        this.selectedProduct = this.products[0]
        this.$nextTick(this.renderChart)
      }).catch(() => {})
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    batchDelete() {
      this.$confirm('确定要批量删除选中的产品吗？', '提示', { type: 'warning' }).then(() => {
        const prev = JSON.parse(JSON.stringify(this.products))
        const names = this.multipleSelection.map(p => p.name)
        this.products = this.products.filter(p => !names.includes(p.name))
        this.filterProducts()
        this.$message.success('批量删除成功')
        this.log('批量删除', `批量删除产品：${names.join(', ')}`)
        this.undoStack.unshift({ type: 'batchDelete', prev })
        this.selectedProduct = this.products[0]
        this.$nextTick(this.renderChart)
      }).catch(() => {})
    },
    undo() {
      if (!this.undoStack.length) return
      const last = this.undoStack.shift()
      this.products = last.prev
      this.filterProducts()
      this.$message.success('撤销成功')
      this.log('撤销', '撤销上一步操作')
      this.selectedProduct = this.products[0]
      this.$nextTick(this.renderChart)
    },
    filterProducts() {
      if (!this.searchName) {
        this.filteredProducts = this.products.slice()
      } else {
        this.filteredProducts = this.products.filter(p => p.name.includes(this.searchName))
      }
      this.currentPage = 1
    },
    handlePageChange(page) {
      this.currentPage = page
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop
      this.sortOrder = order
      if (!prop || !order) return
      this.filteredProducts.sort((a, b) => {
        let valA = a[prop], valB = b[prop]
        if (typeof valA === 'object' && valA !== null && 'min' in valA) valA = valA.min
        if (typeof valB === 'object' && valB !== null && 'min' in valB) valB = valB.min
        if (order === 'ascending') return valA - valB
        if (order === 'descending') return valB - valA
        return 0
      })
      this.currentPage = 1
    },
    exportExcel() {
      const data = this.products.map(p => {
        const row = { 产品名称: p.name }
        this.metals.forEach(metal => {
          row[metal + '最小'] = p[metal].min
          row[metal + '最大'] = p[metal].max
        })
        return row
      })
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '产品数据')
      XLSX.writeFile(wb, '产品数据.xlsx')
      this.log('导出', '导出产品数据为Excel')
    },
    importExcel(file) {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json(sheet)
          const products = json.map(row => {
            const product = { name: row['产品名称'] }
            this.metals.forEach(metal => {
              product[metal] = {
                min: Number(row[metal + '最小']) || 0,
                max: Number(row[metal + '最大']) || 0
              }
            })
            return product
          })
          const prev = JSON.parse(JSON.stringify(this.products))
          this.products = products
          this.filterProducts()
          this.$message.success('导入成功')
          this.log('导入', '导入产品数据Excel')
          this.undoStack.unshift({ type: 'import', prev })
          this.selectedProduct = this.products[0]
          this.$nextTick(this.renderChart)
          resolve(false)
        }
        reader.readAsArrayBuffer(file)
      })
    },
    revertProduct(name, idx) {
      const history = this.productHistory[name]
      if (!history || !history[idx]) return
      const prev = JSON.parse(JSON.stringify(this.products))
      const reverted = JSON.parse(JSON.stringify(history[idx]))
      const i = this.products.findIndex(p => p.name === name)
      if (i !== -1) {
        this.products.splice(i, 1, reverted)
        this.filterProducts()
        this.$message.success('已回退到历史版本')
        this.log('回退', `产品${name}回退到${reverted.time}`)
        this.undoStack.unshift({ type: 'revert', prev })
        this.selectedProduct = this.products[0]
        this.$nextTick(this.renderChart)
      }
    },
    validateComposition(product, cb) {
      // 智能校验：总含量不能超过100%，可扩展特殊规则
      let total = 0
      this.metals.forEach(m => {
        total += Number(product[m].max) || 0
      })
      if (total > 100) {
        cb && cb(false, '所有成分最大值总和不能超过100%')
        return false
      }
      // 特殊规则举例：Si+Fe不能超过0.7
      if ((Number(product.Si.max) || 0) + (Number(product.Fe.max) || 0) > 0.7) {
        cb && cb(false, 'Si+Fe最大值不能超过0.7%')
        return false
      }
      cb && cb(true)
      return true
    }
  }
}
</script>

<style scoped>
.product-manage-container {
  padding: 20px;
}
.toolbar {
  margin-bottom: 15px;
  flex-wrap: wrap;
}
.theme-dark {
  background: #181c27;
  color: #fff;
}
.theme-light {
  background: #fff;
  color: #333;
}
.el-card {
  background: transparent;
  border: none;
}
.theme-dark .el-card {
  background: #23263a !important;
  color: #fff !important;
}
.theme-dark .el-table {
  background: #23263a !important;
  color: #fff !important;
}
.theme-dark .el-table th, .theme-dark .el-table td {
  background: #23263a !important;
  color: #fff !important;
}
.product-chart-area {
  width: 100%;
  min-width: 400px;
  height: 480px;
  padding: 24px 32px 24px 32px;
  box-sizing: border-box;
}
@media (max-width: 900px) {
  .product-manage-container {
    padding: 4px;
  }
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .product-chart-area {
    min-width: 200px;
    height: 320px;
    padding: 8px;
  }
}
</style>