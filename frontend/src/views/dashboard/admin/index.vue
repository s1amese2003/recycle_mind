<template>
  <div class="dashboard-editor-container">
    <div class="main-title">
      <h1>铝合金智能生产管理系统</h1>
      <p>本系统可以帮助您快速计算最优配料方案</p>
      <p>提高生产效率</p>
    </div>
    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="chart" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              计算次数
            </div>
            <count-to :start-val="0" :end-val="5" :duration="2600" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="documentation" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              保存配方
            </div>
            <count-to :start-val="0" :end-val="5" :duration="3000" class="card-panel-num" />
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="8" class="card-panel-col">
        <div class="card-panel">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="table" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">
              原料总数
            </div>
            <count-to :start-val="0" :end-val="33" :duration="3200" class="card-panel-num" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  name: 'DashboardAdmin',
  components: {
    CountTo
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .main-title {
    text-align: center;
    color: #303133;
    margin-bottom: 50px;

    h1 {
      font-size: 32px;
      font-weight: 600;
    }

    p {
      font-size: 16px;
      color: #606266;
      line-height: 1.5;
    }
  }

  .panel-group {
    width: 100%;
    max-width: 1000px;
    .card-panel-col {
      margin-bottom: 32px;
    }

    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      overflow: hidden;
      color: #666;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;

      &:hover {
        .card-panel-icon-wrapper {
          color: #fff;
        }

        .icon-people {
          background: #40c9c6;
        }

        .icon-message {
          background: #36a3f7;
        }

        .icon-money {
          background: #f4516c;
        }

        .icon-shopping {
          background: #34bfa3
        }
      }

      .icon-people {
        color: #40c9c6;
      }

      .icon-message {
        color: #36a3f7;
      }

      .icon-money {
        color: #f4516c;
      }

      .icon-shopping {
        color: #34bfa3
      }

      .card-panel-icon-wrapper {
        height: 100%;
        display: flex;
        align-items: center;
        margin-right: 14px;
        padding: 6px;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        font-size: 48px;
      }

      .card-panel-description {
        font-weight: bold;
        text-align: center;
        flex-grow: 1;

        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }

        .card-panel-num {
          font-size: 20px;
        }
      }
    }
  }
}

</style>
