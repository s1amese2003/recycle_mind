<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="废料名称/编号"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        添加废料
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
      <el-table-column label="废料编号" prop="id" align="center" width="100" />

      <el-table-column label="废料名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="存放区域" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.storage_area }}</span>
        </template>
      </el-table-column>

      <el-table-column label="库存" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.stock_kg }} kg</span>
        </template>
      </el-table-column>

      <el-table-column label="单价" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.unit_price }} 元/kg</span>
        </template>
      </el-table-column>

      <el-table-column label="成分构成" min-width="250px" align="left">
        <template slot-scope="{row}">
          <div style="display: flex; flex-wrap: wrap;">
            <el-tag
              v-for="(value, key) in row.composition"
              :key="key"
              size="mini"
              style="margin-right: 5px; margin-bottom: 5px;"
            >
              {{ key }}: {{ value }}%
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="success" @click="handleStock(row)">
            库存变更
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 废料编辑/新增对话框 -->
    <el-dialog :title="dialogStatus === 'create' ? '添加废料' : '编辑废料'" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="废料名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>

        <el-form-item label="存放区域" prop="storage_area">
          <el-input v-model="temp.storage_area" />
        </el-form-item>

        <el-form-item label="库存(kg)" prop="stock_kg">
          <el-input-number v-model="temp.stock_kg" :min="0" />
        </el-form-item>

        <el-form-item label="单价(元/kg)" prop="unit_price">
          <el-input-number v-model="temp.unit_price" :min="0" :precision="2" />
        </el-form-item>

        <el-form-item label="成分构成">
          <div v-for="(element, index) in temp.elements" :key="index" style="margin-bottom:10px">
            <el-input v-model="element.name" style="width:120px" placeholder="元素名称">
              <template slot="append">
                <el-input-number v-model="element.percentage" :min="0" :max="100" :precision="2" size="mini" />%
              </template>
            </el-input>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click.prevent="removeElement(element)" />
          </div>
          <el-button type="text" @click="addElement">+ 添加元素</el-button>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 库存变更对话框 -->
    <el-dialog title="库存变更" :visible.sync="stockDialogVisible">
      <el-form
        ref="stockForm"
        :model="stockForm"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="变更类型">
          <el-radio-group v-model="stockForm.type">
            <el-radio label="in">入库</el-radio>
            <el-radio label="out">出库</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="变更数量">
          <el-input-number v-model="stockForm.amount" :min="1" />
        </el-form-item>

        <el-form-item label="变更原因">
          <el-input type="textarea" v-model="stockForm.reason" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="stockDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateStock">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getWasteMaterialList, createWasteMaterial, updateWasteMaterial, deleteWasteMaterial } from '@/api/waste-material'

// Helper function to convert elements array to composition object
function elementsToComposition(elements) {
  if (!Array.isArray(elements)) return {}
  return elements.reduce((acc, element) => {
    if (element.name) {
      acc[element.name] = element.percentage || 0
    }
    return acc
  }, {})
}

// Helper function to convert composition object to elements array
function compositionToElements(composition) {
  let parsedComposition = composition
  if (typeof parsedComposition === 'string' && parsedComposition) {
    try {
      parsedComposition = JSON.parse(parsedComposition)
    } catch (e) {
      console.error('解析成分构成字符串时出错:', e)
      return []
    }
  }

  if (typeof parsedComposition !== 'object' || parsedComposition === null) return []
  return Object.keys(parsedComposition).map(key => ({
    name: key,
    percentage: parsedComposition[key]
  }))
}

export default {
  name: 'WasteMaterial',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined,
        type: undefined
      },
      temp: {
        id: undefined,
        name: '',
        storage_area: '',
        stock_kg: 0,
        unit_price: 0,
        elements: [] // Use elements array for form editing
      },
      dialogFormVisible: false,
      dialogStatus: '',
      stockDialogVisible: false,
      stockForm: {
        id: null,
        type: 'in',
        amount: 1,
        reason: ''
      },
      rules: {
        name: [{ required: true, message: '请输入废料名称', trigger: 'blur' }],
        storage_area: [{ required: true, message: '请输入存放区域', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      getWasteMaterialList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(err => {
        console.error('调用 getWasteMaterialList API 时捕获到错误:', err)
        this.listLoading = false
      })
    },

    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        storage_area: '',
        stock_kg: 0,
        unit_price: 0,
        elements: []
      }
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const postData = { ...this.temp }
          postData.composition = elementsToComposition(postData.elements)
          delete postData.elements

          createWasteMaterial(postData).then(() => {
            this.getList() // Refresh list to get new data
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = {
        ...row,
        elements: compositionToElements(row.composition)
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const postData = { ...this.temp }
          postData.composition = elementsToComposition(postData.elements)
          delete postData.elements

          updateWasteMaterial(postData.id, postData).then(() => {
            this.getList() // Refresh list
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定要删除废料 ${row.name} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteWasteMaterial(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.findIndex(v => v.id === row.id)
          this.list.splice(index, 1)
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },

    addElement() {
      this.temp.elements.push({ name: '', percentage: 0 });
    },
    removeElement(item) {
      const index = this.temp.elements.indexOf(item)
      if (index !== -1) {
        this.temp.elements.splice(index, 1)
      }
    },

    handleStock(row) {
      this.stockForm.id = row.id
      this.stockDialogVisible = true
    },

    updateStock() {
      const currentItem = this.list.find(item => item.id === this.stockForm.id)
      if (!currentItem) {
        this.$message.error('未找到要更新的物料！')
        return
      }

      let newStock = Number(currentItem.stock_kg)
      const changeAmount = Number(this.stockForm.amount)

      if (this.stockForm.type === 'in') {
        newStock += changeAmount
      } else {
        newStock -= changeAmount
        if (newStock < 0) {
          this.$message.error('出库数量不能大于当前库存！')
          return
        }
      }

      const postData = { ...currentItem, stock_kg: newStock }

      updateWasteMaterial(postData.id, postData).then(() => {
        this.getList() // Refresh list
        this.stockDialogVisible = false
        this.$notify({
          title: '成功',
          message: '库存更新成功',
          type: 'success',
          duration: 2000
        })
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 15px;
}
</style>
