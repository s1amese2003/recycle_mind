<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.search" placeholder="客户名称/牌号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="客户名称" prop="customer_name" width="150px" />
      <el-table-column label="牌号" prop="model_number" width="150px" />
      <el-table-column label="分类" prop="category" width="110px" />
      <el-table-column v-for="metal in metals" :key="metal.key" :label="metal.label" width="150px">
        <template slot-scope="{row}">
          <span>{{ row[metal.key] ? `${row[metal.key].min} - ${row[metal.key].max}` : 'N/A' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <product-edit-dialog
      :visible.sync="dialogFormVisible"
      :product="temp"
      :categories="categories"
      :metals="metals"
      @save="handleSave"
    />
  </div>
</template>

<script>
import { fetchList, createProduct, updateProduct, deleteProduct } from '@/api/product'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import ProductEditDialog from '@/components/ProductEditDialog.vue'

const defaultProductForm = {
  id: undefined,
  customer_name: '',
  model_number: '',
  category: '',
  Si: { min: 0, max: 0 },
  Fe: { min: 0, max: 0 },
  Cu: { min: 0, max: 0 },
  Mn: { min: 0, max: 0 },
  Mg: { min: 0, max: 0 },
  Ti: { min: 0, max: 0 },
  Cr: { min: 0, max: 0 },
  Zn: { min: 0, max: 0 },
  Zr: { min: 0, max: 0 },
  others: { min: 0, max: 0 },
  total_others: { min: 0, max: 0 }
}

export default {
  name: 'ProductManagement',
  components: { Pagination, ProductEditDialog },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        search: undefined
      },
      temp: { ...defaultProductForm },
      dialogFormVisible: false,
      categories: ['ADC12', 'A380', 'AlSi12Fe'],
      metals: [
        { key: 'Si', label: 'Si (%)' },
        { key: 'Fe', label: 'Fe (%)' },
        { key: 'Cu', label: 'Cu (%)' },
        { key: 'Mn', label: 'Mn (%)' },
        { key: 'Mg', label: 'Mg (%)' },
        { key: 'Ti', label: 'Ti (%)' },
        { key: 'Cr', label: 'Cr (%)' },
        { key: 'Zn', label: 'Zn (%)' },
        { key: 'Zr', label: 'Zr (%)' },
        { key: 'others', label: '其他单个 (%)' },
        { key: 'total_others', label: '其他合计 (%)' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = { ...defaultProductForm }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogFormVisible = true
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该产品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteProduct(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        })
      }).catch(() => {
      });
    },
    handleSave(formData) {
      if (formData.id) {
        // Update
        updateProduct(formData.id, formData).then((response) => {
          const index = this.list.findIndex(v => v.id === formData.id)
          this.list.splice(index, 1, response.data)
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        })
      } else {
        // Create
        createProduct(formData).then((response) => {
          this.list.unshift(response.data)
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
        })
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
</style>
