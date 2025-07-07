<template>
  <div class="app-container">
    <el-tabs v-model="activeTab">
      <!-- 生产计划 -->
      <el-tab-pane label="生产计划" name="plan">
        <div class="filter-container">
          <el-button
            class="filter-item"
            type="primary"
            icon="el-icon-plus"
            @click="handleCreatePlan"
          >
            新建计划
          </el-button>
        </div>

        <el-table
          :data="planList"
          border
          style="width: 100%"
        >
          <el-table-column
            label="计划编号"
            prop="id"
            width="120"
            align="center"
          />
          <el-table-column
            label="成品名称"
            prop="productName"
            min-width="120"
          />
          <el-table-column
            label="计划产量"
            width="120"
            align="center"
          >
            <template slot-scope="{row}">
              {{ row.targetAmount }} {{ row.unit }}
            </template>
          </el-table-column>
          <el-table-column
            label="开始时间"
            width="180"
            align="center"
          >
            <template slot-scope="{row}">
              {{ row.startTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            width="100"
            align="center"
          >
            <template slot-scope="{row}">
              <el-tag :type="row.status | statusTypeFilter">
                {{ row.status | statusFilter }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="230"
          >
            <template slot-scope="{row}">
              <el-button
                size="mini"
                type="primary"
                @click="handleUpdatePlan(row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="success"
                @click="handleStartProduction(row)"
                v-if="row.status === 'pending'"
              >
                开始生产
              </el-button>
              <el-button
                size="mini"
                type="info"
                @click="handleCompletePlan(row)"
                v-if="row.status === 'processing'"
              >
                完成生产
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 生产记录 -->
      <el-tab-pane label="生产记录" name="record">
        <div class="filter-container">
          <el-date-picker
            v-model="listQuery.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="filter-item"
            style="width: 360px"
          />
          <el-button
            v-waves
            class="filter-item"
            type="primary"
            icon="el-icon-search"
            @click="handleFilter"
          >
            搜索
          </el-button>
        </div>

        <el-table
          :data="recordList"
          border
          style="width: 100%"
        >
          <el-table-column
            label="记录编号"
            prop="id"
            width="120"
            align="center"
          />
          <el-table-column
            label="计划编号"
            prop="planId"
            width="120"
            align="center"
          />
          <el-table-column
            label="成品名称"
            prop="productName"
            min-width="120"
          />
          <el-table-column
            label="实际产量"
            width="120"
            align="center"
          >
            <template slot-scope="{row}">
              {{ row.actualAmount }} {{ row.unit }}
            </template>
          </el-table-column>
          <el-table-column
            label="生产时间"
            width="180"
            align="center"
          >
            <template slot-scope="{row}">
              {{ row.productionTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作员"
            width="120"
            align="center"
            prop="operator"
          />
          <el-table-column
            label="质检结果"
            width="100"
            align="center"
          >
            <template slot-scope="{row}">
              <el-tag :type="row.qualityCheck === 'pass' ? 'success' : 'danger'">
                {{ row.qualityCheck === 'pass' ? '合格' : '不合格' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="120"
          >
            <template slot-scope="{row}">
              <el-button
                size="mini"
                type="primary"
                @click="handleViewDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 生产计划对话框 -->
    <el-dialog :title="dialogStatus === 'create' ? '新建生产计划' : '编辑生产计划'" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="成品名称" prop="productName">
          <el-select v-model="temp.productName" placeholder="请选择成品">
            <el-option
              v-for="item in productOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="计划产量" prop="targetAmount">
          <el-input-number v-model="temp.targetAmount" :min="1" />
          <span style="margin-left: 10px">{{ temp.unit }}</span>
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="temp.startTime"
            type="datetime"
            placeholder="选择开始时间"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入备注内容"
            v-model="temp.remark"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 生产详情对话框 -->
    <el-dialog title="生产详情" :visible.sync="detailDialogVisible" width="650px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="计划编号">{{ detail.planId }}</el-descriptions-item>
        <el-descriptions-item label="成品名称">{{ detail.productName }}</el-descriptions-item>
        <el-descriptions-item label="实际产量">{{ detail.actualAmount }} {{ detail.unit }}</el-descriptions-item>
        <el-descriptions-item label="生产时间">
          {{ detail.productionTime | parseTime('{y}-{m}-{d} {h}:{i}') }}
        </el-descriptions-item>
        <el-descriptions-item label="操作员">{{ detail.operator }}</el-descriptions-item>
        <el-descriptions-item label="质检结果" :span="2">
          <el-tag :type="detail.qualityCheck === 'pass' ? 'success' : 'danger'">
            {{ detail.qualityCheck === 'pass' ? '合格' : '不合格' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="原料消耗" :span="2">
          <el-table :data="detail.materials" border size="small">
            <el-table-column prop="name" label="原料名称" />
            <el-table-column prop="amount" label="消耗量" width="120" align="center">
              <template slot-scope="{row}">
                {{ row.amount }} {{ row.unit }}
              </template>
            </el-table-column>
          </el-table>
        </el-descriptions-item>
        <el-descriptions-item label="质检报告" :span="2">
          {{ detail.qualityReport }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { parseTime } from '@/utils'

export default {
  name: 'Production',
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        pending: '待生产',
        processing: '生产中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status]
    },
    statusTypeFilter(status) {
      const statusMap = {
        pending: 'info',
        processing: 'warning',
        completed: 'success',
        cancelled: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      activeTab: 'plan',
      planList: [],
      recordList: [],
      listQuery: {
        dateRange: []
      },
      dialogStatus: '',
      dialogFormVisible: false,
      detailDialogVisible: false,
      productOptions: [
        { value: 'product1', label: '高纯度铜' },
        { value: 'product2', label: '铝合金' }
      ],
      temp: {
        id: undefined,
        productName: '',
        targetAmount: 100,
        unit: 'kg',
        startTime: undefined,
        remark: ''
      },
      detail: {
        id: '',
        planId: '',
        productName: '',
        actualAmount: 0,
        unit: 'kg',
        productionTime: '',
        operator: '',
        qualityCheck: 'pass',
        materials: [],
        qualityReport: ''
      },
      rules: {
        productName: [{ required: true, message: '请选择成品', trigger: 'change' }],
        targetAmount: [{ required: true, message: '请输入计划产量', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getPlanList()
    this.getRecordList()
  },
  methods: {
    getPlanList() {
      // 模拟数据
      this.planList = [
        {
          id: 'P001',
          productName: '高纯度铜',
          targetAmount: 1000,
          unit: 'kg',
          startTime: new Date(),
          status: 'pending'
        }
      ]
    },
    getRecordList() {
      // 模拟数据
      this.recordList = [
        {
          id: 'R001',
          planId: 'P001',
          productName: '高纯度铜',
          actualAmount: 980,
          unit: 'kg',
          productionTime: new Date(),
          operator: '张三',
          qualityCheck: 'pass'
        }
      ]
    },
    handleFilter() {
      this.getRecordList()
    },
    handleCreatePlan() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 调用后端API创建生产计划
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '生产计划创建成功',
            type: 'success',
            duration: 2000
          })
          this.getPlanList()
        }
      })
    },
    handleUpdatePlan(row) {
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
          // 调用后端API更新生产计划
          this.dialogFormVisible = false
          this.$notify({
            title: '成功',
            message: '生产计划更新成功',
            type: 'success',
            duration: 2000
          })
          this.getPlanList()
        }
      })
    },
    handleStartProduction(row) {
      this.$confirm('确认开始生产？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端API开始生产
        this.$notify({
          title: '成功',
          message: '已开始生产',
          type: 'success',
          duration: 2000
        })
        this.getPlanList()
      })
    },
    handleCompletePlan(row) {
      this.$confirm('确认完成生产？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端API完成生产
        this.$notify({
          title: '成功',
          message: '生产已完成',
          type: 'success',
          duration: 2000
        })
        this.getPlanList()
      })
    },
    handleViewDetail(row) {
      // 模拟获取详情数据
      this.detail = {
        ...row,
        materials: [
          { name: '废铜线', amount: 800, unit: 'kg' },
          { name: '废铁屑', amount: 200, unit: 'kg' }
        ],
        qualityReport: '产品质量检测合格，各项指标符合要求。\n1. 纯度：99.5%\n2. 导电性：良好\n3. 物理性能：符合标准'
      }
      this.detailDialogVisible = true
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
  margin-right: 10px;
}
</style>
