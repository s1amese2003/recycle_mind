<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 关键指标卡片 -->
      <el-col :span="6" v-for="item in keyMetrics" :key="item.title">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-icon">
            <i :class="item.icon"></i>
          </div>
          <div class="metric-content">
            <div class="metric-title">{{ item.title }}</div>
            <div class="metric-value">{{ item.value }}</div>
            <div class="metric-footer">
              <span :class="item.trend >= 0 ? 'up' : 'down'">
                <i :class="item.trend >= 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                {{ Math.abs(item.trend) }}%
              </span>
              较上月
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 库存预警 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>库存预警</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="stockWarnings" style="width: 100%" size="small">
            <el-table-column prop="name" label="废料名称" />
            <el-table-column prop="stock" label="当前库存" width="120" align="center">
              <template slot-scope="{row}">
                {{ row.stock }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column prop="warning" label="预警值" width="120" align="center">
              <template slot-scope="{row}">
                {{ row.warning }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template slot-scope="{row}">
                <el-tag :type="row.stock < row.warning ? 'danger' : 'warning'">
                  {{ row.stock < row.warning ? '库存不足' : '库存偏低' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 生产计划 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>今日生产计划</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看全部</el-button>
          </div>
          <el-table :data="todayPlans" style="width: 100%" size="small">
            <el-table-column prop="productName" label="成品名称" />
            <el-table-column prop="amount" label="计划产量" width="120" align="center">
              <template slot-scope="{row}">
                {{ row.amount }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column prop="progress" label="进度" width="180">
              <template slot-scope="{row}">
                <el-progress :percentage="row.progress" :status="row.progress === 100 ? 'success' : ''"></el-progress>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <!-- 产量趋势图 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>月度产量趋势</span>
            <el-radio-group v-model="chartTimeRange" size="mini" style="float: right">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-wrapper">
            <line-chart :chart-data="productionTrend" />
          </div>
        </el-card>
      </el-col>

      <!-- 原料构成分析 -->
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>原料构成分析</span>
            <el-select v-model="selectedProduct" size="mini" style="float: right; width: 120px">
              <el-option
                v-for="item in productOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="chart-wrapper">
            <pie-chart :chart-data="materialComposition" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import LineChart from './components/LineChart'
import PieChart from './components/PieChart'

export default {
  name: 'RecycleDashboard',
  components: {
    LineChart,
    PieChart
  },
  data() {
    return {
      keyMetrics: [
        {
          title: '本月产量',
          value: '2,530吨',
          icon: 'el-icon-s-data',
          trend: 12.5
        },
        {
          title: '原料库存',
          value: '1,280吨',
          icon: 'el-icon-goods',
          trend: -5.2
        },
        {
          title: '生产计划完成率',
          value: '94.6%',
          icon: 'el-icon-s-claim',
          trend: 2.1
        },
        {
          title: '质检合格率',
          value: '99.2%',
          icon: 'el-icon-s-check',
          trend: 0.5
        }
      ],
      stockWarnings: [
        {
          name: '废铜线',
          stock: 200,
          warning: 500,
          unit: 'kg'
        },
        {
          name: '废铝板',
          stock: 150,
          warning: 300,
          unit: 'kg'
        }
      ],
      todayPlans: [
        {
          productName: '高纯度铜',
          amount: 500,
          unit: 'kg',
          progress: 60
        },
        {
          productName: '铝合金',
          amount: 300,
          unit: 'kg',
          progress: 100
        }
      ],
      chartTimeRange: 'month',
      selectedProduct: 'product1',
      productOptions: [
        { value: 'product1', label: '高纯度铜' },
        { value: 'product2', label: '铝合金' }
      ],
      productionTrend: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
          {
            label: '产量',
            data: [1200, 1350, 1450, 1600, 1520, 1720],
            borderColor: '#409EFF',
            fill: false
          }
        ]
      },
      materialComposition: {
        labels: ['废铜线', '废铁屑', '其他'],
        datasets: [
          {
            data: [70, 20, 10],
            backgroundColor: ['#409EFF', '#67C23A', '#E6A23C']
          }
        ]
      }
    }
  },
  methods: {
    // 在这里添加获取数据的方法
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}

.metric-card {
  height: 108px;
  position: relative;
  overflow: hidden;
  color: #666;
  background: #fff;
  display: flex;
  align-items: center;

  .metric-icon {
    width: 80px;
    height: 80px;
    line-height: 80px;
    text-align: center;
    i {
      font-size: 30px;
      color: #409EFF;
    }
  }

  .metric-content {
    flex: 1;
    padding-right: 10px;

    .metric-title {
      font-size: 14px;
      color: #999;
    }

    .metric-value {
      font-size: 20px;
      font-weight: bold;
      color: #303133;
      margin: 10px 0;
    }

    .metric-footer {
      font-size: 12px;
      color: #999;

      .up {
        color: #67C23A;
      }

      .down {
        color: #F56C6C;
      }
    }
  }
}

.chart-wrapper {
  height: 300px;
}
</style>
