<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el)
      this.setOptions(this.chartData)
    },
    setOptions({ labels, datasets } = {}) {
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: labels
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%'
          },
          min: 60,
          max: 100
        },
        series: datasets.map(dataset => ({
          name: dataset.label,
          type: 'line',
          data: dataset.data,
          itemStyle: {
            normal: {
              color: dataset.borderColor
            }
          },
          lineStyle: {
            normal: {
              width: 2,
              color: dataset.borderColor
            }
          },
          areaStyle: dataset.fill ? {
            normal: {
              color: dataset.backgroundColor || dataset.borderColor,
              opacity: 0.1
            }
          } : null,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8
        }))
      })
    }
  }
}
</script>
