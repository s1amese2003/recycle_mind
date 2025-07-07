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
      <el-select v-model="listQuery.type" placeholder="废料类型" clearable style="width: 130px" class="filter-item">
        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
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
      <el-table-column label="废料编号" prop="id" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="废料名称" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="废料类型" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.type }}</span>
        </template>
      </el-table-column>

      <el-table-column label="当前库存" width="120px" align="center">
        <template slot-scope="{row}">
          <span :class="row.stock < row.warningLevel ? 'text-warning' : ''">
            {{ row.stock }} {{ row.unit }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="预警值" width="120px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.warningLevel }} {{ row.unit }}</span>
        </template>
      </el-table-column>

      <el-table-column label="元素构成" min-width="200px" align="center">
        <template slot-scope="{row}">
          <el-tag v-for="(element, index) in row.elements"
            :key="index"
            size="mini"
            style="margin-right: 5px">
            {{ element.name }}: {{ element.percentage }}%
          </el-tag>
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

    <!-- 废料编辑对话框 -->
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

        <el-form-item label="废料类型" prop="type">
          <el-select v-model="temp.type" class="filter-item">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="计量单位" prop="unit">
          <el-input v-model="temp.unit" />
        </el-form-item>

        <el-form-item label="预警值" prop="warningLevel">
          <el-input-number v-model="temp.warningLevel" :min="0" />
        </el-form-item>

        <el-form-item label="元素构成">
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
      typeOptions: [
        { label: '金属类', value: 'metal' },
        { label: '塑料类', value: 'plastic' },
        { label: '电子类', value: 'electronic' },
        { label: '其他', value: 'other' }
      ],
      temp: {
        id: undefined,
        name: '',
        type: '',
        unit: '',
        stock: 0,
        warningLevel: 0,
        elements: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      stockDialogVisible: false,
      stockForm: {
        type: 'in',
        amount: 1,
        reason: ''
      },
      rules: {
        name: [{ required: true, message: '请输入废料名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择废料类型', trigger: 'change' }],
        unit: [{ required: true, message: '请输入计量单位', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // 这里需要调用后端API获取数据
      // fetchWasteMaterialList(this.listQuery).then(response => {
      //   this.list = response.data.items
      //   this.total = response.data.total
      //   this.listLoading = false
      // })

      // 模拟数据
      setTimeout(() => {
        this.list = [
          {
            id: 1,
            name: '废铜线',
            type: 'metal',
            stock: 1000,
            unit: 'kg',
            warningLevel: 500,
            elements: [
              { name: 'Cu', percentage: 95 },
              { name: 'Fe', percentage: 5 }
            ]
          }
        ]
        this.total = 1
        this.listLoading = false
      }, 1000)
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        type: '',
        unit: '',
        stock: 0,
        warningLevel: 0,
        elements: []
      }
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
          // 调用后端API创建数据
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '创建成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 调用后端API更新数据
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该废料记录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端API删除数据
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleStock(row) {
      this.stockForm = {
        type: 'in',
        amount: 1,
        reason: ''
      }
      this.stockDialogVisible = true
    },
    updateStock() {
      // 调用后端API更新库存
      this.stockDialogVisible = false
      this.$notify({
        title: '成功',
        message: '库存更新成功',
        type: 'success',
        duration: 2000
      })
    },
    addElement() {
      this.temp.elements.push({
        name: '',
        percentage: 0
      })
    },
    removeElement(item) {
      const index = this.temp.elements.indexOf(item)
      if (index !== -1) {
        this.temp.elements.splice(index, 1)
      }
    }
  }
}
</script>

<style>
.text-warning {
  color: #E6A23C;
}
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
}
</style>
