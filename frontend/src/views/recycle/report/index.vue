<template>
  <div class="app-container">
    <!-- 时间范围选择 -->
    <div class="filter-container">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        class="filter-item"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        查询
      </el-button>
      <el-button
        class="filter-item"
        type="success"
        icon="el-icon-download"
        @click="handleDownload"
      >
        导出报表
      </el-button>
    </div>

    <el-row :gutter="20">
      <!-- 生产统计 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>生产统计</span>
          </div>
          <el-table
            :data="productionStats"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="productName"
              label="成品名称"
              min-width="120"
            />
            <el-table-column
              prop="totalAmount"
              label="生产总量"
              width="120"
              align="center"
            >
              <template slot-scope="{row}">
                {{ row.totalAmount }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column
              prop="batchCount"
              label="生产批次"
              width="100"
              align="center"
            />
            <el-table-column
              prop="qualifiedRate"
              label="合格率"
              width="100"
              align="center"
            >
              <template slot-scope="{row}">
                {{ row.qualifiedRate }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 原料消耗 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>原料消耗</span>
          </div>
          <el-table
            :data="materialConsumption"
            border
            style="width: 100%"
          >
            <el-table-column
              prop="materialName"
              label="原料名称"
              min-width="120"
            />
            <el-table-column
              prop="consumption"
              label="消耗量"
              width="120"
              align="center"
            >
              <template slot-scope="{row}">
                {{ row.consumption }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column
              prop="cost"
              label="成本"
              width="120"
              align="center"
            >
              <template slot-scope="{row}">
                ¥{{ row.cost }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 成本分析 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>成本分析</span>
          </div>
          <div class="chart-wrapper">
            <cost-analysis-chart :chart-data="costAnalysis" />
          </div>
        </el-card>
      </el-col>

      <!-- 生产效率分析 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>生产效率分析</span>
          </div>
          <div class="chart-wrapper">
            <efficiency-chart :chart-data="efficiencyData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="box-card" style="margin-top: 20px">
      <div slot="header" class="clearfix">
        <span>详细生产记录</span>
      </div>
      <el-table
        :data="detailRecords"
        border
        style="width: 100%"
      >
        <el-table-column
          prop="date"
          label="日期"
          width="180"
          align="center"
        >
          <template slot-scope="{row}">
            {{ row.date | parseTime('{y}-{m}-{d}') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="productName"
          label="成品名称"
          min-width="120"
        />
        <el-table-column
          prop="batchNo"
          label="批次号"
          width="120"
          align="center"
        />
        <el-table-column
          prop="amount"
          label="产量"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            {{ row.amount }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column
          prop="cost"
          label="成本"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            ¥{{ row.cost }}
          </template>
        </el-table-column>
        <el-table-column
          prop="efficiency"
          label="生产效率"
          width="120"
          align="center"
        >
          <template slot-scope="{row}">
            {{ row.efficiency }}%
          </template>
        </el-table-column>
        <el-table-column
          prop="operator"
          label="操作员"
          width="120"
          align="center"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import CostAnalysisChart from './components/CostAnalysisChart'
import EfficiencyChart from './components/EfficiencyChart'

export default {
  name: 'Report',
  components: {
    CostAnalysisChart,
    EfficiencyChart
  },
  directives: { waves },
  data() {
    return {
      dateRange: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      productionStats: [
        {
          productName: '高纯度铜',
          totalAmount: 5000,
          unit: 'kg',
          batchCount: 10,
          qualifiedRate: 98.5
        },
        {
          productName: '铝合金',
          totalAmount: 3000,
          unit: 'kg',
          batchCount: 6,
          qualifiedRate: 97.8
        }
      ],
      materialConsumption: [
        {
          materialName: '废铜线',
          consumption: 4800,
          unit: 'kg',
          cost: 48000
        },
        {
          materialName: '废铝板',
          consumption: 2900,
          unit: 'kg',
          cost: 23200
        }
      ],
      costAnalysis: {
        labels: ['原料成本', '人工成本', '能源成本', '其他成本'],
        datasets: [{
          data: [70, 15, 10, 5],
          backgroundColor: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
        }]
      },
      efficiencyData: {
        labels: ['周一', '周二', '周三', '周四', '周五'],
        datasets: [{
          label: '生产效率',
          data: [85, 88, 92, 87, 90],
          borderColor: '#409EFF',
          fill: false
        }]
      },
      detailRecords: [
        {
          date: new Date(),
          productName: '高纯度铜',
          batchNo: 'B001',
          amount: 500,
          unit: 'kg',
          cost: 5000,
          efficiency: 92,
          operator: '张三'
        }
      ]
    }
  },
  methods: {
    handleFilter() {
      // 根据日期范围获取数据
      console.log('查询日期范围：', this.dateRange)
    },
    handleDownload() {
      // 导出报表
      this.$message({
        message: '报表导出中...',
        type: 'success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 20px;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}

.chart-wrapper {
  height: 300px;
}
</style>
