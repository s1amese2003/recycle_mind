<template>
  <div class="app-container">
    <!-- 生产计划 -->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>生产计划</span>
        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-plus" @click="handlePlanCreate">新增计划</el-button>
      </div>
      <el-table v-loading="planListLoading" :data="planList" border style="width: 100%">
        <el-table-column prop="id" label="计划ID" width="180" />
        <el-table-column prop="productName" label="成品名称" />
        <el-table-column prop="targetAmount" label="计划产量" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="startTime" label="计划开始时间">
          <template slot-scope="{row}">
            <span>{{ row.startTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="{row}">
            <el-tag :type="row.status | planStatusFilter">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{row, $index}">
            <el-button type="primary" size="mini" @click="handlePlanUpdate(row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handlePlanDelete(row, $index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 生产记录 -->
    <el-card class="box-card" style="margin-top: 20px;">
      <div slot="header" class="clearfix">
        <span>生产记录</span>
        <el-button style="float: right; padding: 3px 0" type="text" icon="el-icon-plus" @click="handleRecordCreate">新增记录</el-button>
      </div>
      <el-table v-loading="recordListLoading" :data="recordList" border style="width: 100%">
        <el-table-column prop="id" label="记录ID" width="180" />
        <el-table-column prop="planId" label="关联计划ID" width="180" />
        <el-table-column prop="productName" label="成品名称" />
        <el-table-column prop="actualAmount" label="实际产量" />
        <el-table-column prop="unit" label="单位" />
        <el-table-column prop="productionTime" label="生产时间">
          <template slot-scope="{row}">
            <span>{{ row.productionTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" />
        <el-table-column prop="qualityCheck" label="质检结果" />
        <el-table-column label="操作" width="150">
          <template slot-scope="{row, $index}">
            <el-button type="primary" size="mini" @click="handleRecordUpdate(row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleRecordDelete(row, $index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 生产计划对话框 -->
    <el-dialog :title="planTextMap[planDialogStatus]" :visible.sync="planDialogFormVisible">
      <el-form ref="planDataForm" :rules="planRules" :model="planTemp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="成品名称" prop="productName">
          <el-input v-model="planTemp.productName" />
        </el-form-item>
        <el-form-item label="计划产量" prop="targetAmount">
          <el-input-number v-model="planTemp.targetAmount" :min="0" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="planTemp.unit" />
        </el-form-item>
        <el-form-item label="计划开始时间" prop="startTime">
          <el-date-picker v-model="planTemp.startTime" type="datetime" placeholder="选择日期时间" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="planTemp.status" placeholder="请选择">
            <el-option label="待执行" value="待执行" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="planTemp.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="planDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="planDialogStatus==='create'?createPlanData():updatePlanData()">确认</el-button>
      </div>
    </el-dialog>

    <!-- 生产记录对话框 -->
    <el-dialog :title="recordTextMap[recordDialogStatus]" :visible.sync="recordDialogFormVisible">
      <el-form ref="recordDataForm" :rules="recordRules" :model="recordTemp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="关联计划ID" prop="planId">
          <el-input v-model="recordTemp.planId" />
        </el-form-item>
        <el-form-item label="成品名称" prop="productName">
          <el-input v-model="recordTemp.productName" />
        </el-form-item>
        <el-form-item label="实际产量" prop="actualAmount">
          <el-input-number v-model="recordTemp.actualAmount" :min="0" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="recordTemp.unit" />
        </el-form-item>
        <el-form-item label="生产时间" prop="productionTime">
          <el-date-picker v-model="recordTemp.productionTime" type="datetime" placeholder="选择日期时间" />
        </el-form-item>
        <el-form-item label="操作员" prop="operator">
          <el-input v-model="recordTemp.operator" />
        </el-form-item>
        <el-form-item label="质检结果" prop="qualityCheck">
          <el-input v-model="recordTemp.qualityCheck" />
        </el-form-item>
        <el-form-item label="质检报告" prop="qualityReport">
          <el-input v-model="recordTemp.qualityReport" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="recordDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="recordDialogStatus==='create'?createRecordData():updateRecordData()">确认</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  getProductionPlans, addProductionPlan, updateProductionPlan, deleteProductionPlan,
  getProductionRecords, addProductionRecord, updateProductionRecord, deleteProductionRecord
} from '@/api/production'
import { parseTime } from '@/utils'

export default {
  name: 'ProductionManagement',
  filters: {
    parseTime(time, cFormat) {
      if (!time) return ''
      return parseTime(time, cFormat)
    },
    planStatusFilter(status) {
      const statusMap = {
        '已完成': 'success',
        '进行中': 'primary',
        '待执行': 'info',
        '已取消': 'danger'
      }
      return statusMap[status] || 'warning'
    }
  },
  data() {
    return {
      // 生产计划
      planList: [],
      planListLoading: true,
      planDialogFormVisible: false,
      planDialogStatus: '',
      planTextMap: { update: '编辑计划', create: '新增计划' },
      planTemp: {},
      planRules: {
        productName: [{ required: true, message: '成品名称不能为空', trigger: 'blur' }],
        targetAmount: [{ required: true, message: '计划产量不能为空', trigger: 'blur' }],
        unit: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '计划时间不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      },
      // 生产记录
      recordList: [],
      recordListLoading: true,
      recordDialogFormVisible: false,
      recordDialogStatus: '',
      recordTextMap: { update: '编辑记录', create: '新增记录' },
      recordTemp: {},
      recordRules: {
        productName: [{ required: true, message: '成品名称不能为空', trigger: 'blur' }],
        actualAmount: [{ required: true, message: '实际产量不能为空', trigger: 'blur' }],
        unit: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
        productionTime: [{ required: true, message: '生产时间不能为空', trigger: 'change' }],
        operator: [{ required: true, message: '操作员不能为空', trigger: 'blur' }],
        qualityCheck: [{ required: true, message: '质检结果不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchPlans()
    this.fetchRecords()
  },
  methods: {
    // --- 生产计划方法 ---
    fetchPlans() {
      this.planListLoading = true
      getProductionPlans().then(response => {
        this.planList = response.data.items
        this.planListLoading = false
      })
    },
    resetPlanTemp() {
      this.planTemp = {
        id: undefined,
        productName: '',
        targetAmount: 0,
        unit: '吨',
        startTime: new Date(),
        status: '待执行',
        remark: ''
      }
    },
    handlePlanCreate() {
      this.resetPlanTemp()
      this.planDialogStatus = 'create'
      this.planDialogFormVisible = true
      this.$nextTick(() => this.$refs['planDataForm'].clearValidate())
    },
    createPlanData() {
      this.$refs['planDataForm'].validate(valid => {
        if (valid) {
          const postData = {
            product_name: this.planTemp.productName,
            target_amount: this.planTemp.targetAmount,
            unit: this.planTemp.unit,
            start_time: this.planTemp.startTime,
            status: this.planTemp.status,
            remark: this.planTemp.remark
          }
          addProductionPlan(postData).then(() => {
            this.fetchPlans()
            this.planDialogFormVisible = false
            this.$notify({ title: '成功', message: '新增计划成功', type: 'success', duration: 2000 })
          })
        }
      })
    },
    handlePlanUpdate(row) {
      this.planTemp = Object.assign({}, row)
      this.planDialogStatus = 'update'
      this.planDialogFormVisible = true
      this.$nextTick(() => this.$refs['planDataForm'].clearValidate())
    },
    updatePlanData() {
      this.$refs['planDataForm'].validate(valid => {
        if (valid) {
          // 确保所有字段都从前端的 camelCase 转换为后端的 snake_case
          const postData = {
            product_name: this.planTemp.productName,
            target_amount: this.planTemp.targetAmount,
            unit: this.planTemp.unit,
            start_time: this.planTemp.startTime,
            status: this.planTemp.status, // 确认 status 字段被正确传递
            remark: this.planTemp.remark
          }
          updateProductionPlan(this.planTemp.id, postData).then(() => {
            this.fetchPlans()
            this.planDialogFormVisible = false
            this.$notify({ title: '成功', message: '更新计划成功', type: 'success', duration: 2000 })
          })
        }
      })
    },
    handlePlanDelete(row, index) {
      this.$confirm('确定删除此生产计划吗?', '提示', { type: 'warning' }).then(() => {
        deleteProductionPlan(row.id).then(() => {
          this.planList.splice(index, 1)
          this.$notify({ title: '成功', message: '删除计划成功', type: 'success', duration: 2000 })
        })
      }).catch(() => {})
    },

    // --- 生产记录方法 ---
    fetchRecords() {
      this.recordListLoading = true
      getProductionRecords().then(response => {
        this.recordList = response.data.items
        this.recordListLoading = false
      })
    },
    resetRecordTemp() {
      this.recordTemp = {
        id: undefined,
        planId: '',
        productName: '',
        actualAmount: 0,
        unit: '吨',
        productionTime: new Date(),
        operator: '',
        qualityCheck: '合格',
        qualityReport: ''
      }
    },
    handleRecordCreate() {
      this.resetRecordTemp()
      this.recordDialogStatus = 'create'
      this.recordDialogFormVisible = true
      this.$nextTick(() => this.$refs['recordDataForm'].clearValidate())
    },
    createRecordData() {
      this.$refs['recordDataForm'].validate(valid => {
        if (valid) {
          const postData = {
            plan_id: this.recordTemp.planId,
            product_name: this.recordTemp.productName,
            actual_amount: this.recordTemp.actualAmount,
            unit: this.recordTemp.unit,
            production_time: this.recordTemp.productionTime,
            operator: this.recordTemp.operator,
            quality_check: this.recordTemp.qualityCheck,
            quality_report: this.recordTemp.qualityReport
          }
          addProductionRecord(postData).then(() => {
            this.fetchRecords()
            this.recordDialogFormVisible = false
            this.$notify({ title: '成功', message: '新增记录成功', type: 'success', duration: 2000 })
          })
        }
      })
    },
    handleRecordUpdate(row) {
      this.recordTemp = Object.assign({}, row)
      this.recordDialogStatus = 'update'
      this.recordDialogFormVisible = true
      this.$nextTick(() => this.$refs['recordDataForm'].clearValidate())
    },
    updateRecordData() {
      this.$refs['recordDataForm'].validate(valid => {
        if (valid) {
          const postData = {
            plan_id: this.recordTemp.planId,
            product_name: this.recordTemp.productName,
            actual_amount: this.recordTemp.actualAmount,
            unit: this.recordTemp.unit,
            production_time: this.recordTemp.productionTime,
            operator: this.recordTemp.operator,
            quality_check: this.recordTemp.qualityCheck,
            quality_report: this.recordTemp.qualityReport
          }
          updateProductionRecord(this.recordTemp.id, postData).then(() => {
            this.fetchRecords()
            this.recordDialogFormVisible = false
            this.$notify({ title: '成功', message: '更新记录成功', type: 'success', duration: 2000 })
          })
        }
      })
    },
    handleRecordDelete(row, index) {
      this.$confirm('确定删除此生产记录吗?', '提示', { type: 'warning' }).then(() => {
        deleteProductionRecord(row.id).then(() => {
          this.recordList.splice(index, 1)
          this.$notify({ title: '成功', message: '删除记录成功', type: 'success', duration: 2000 })
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.box-card {
  width: 100%;
}
</style>
