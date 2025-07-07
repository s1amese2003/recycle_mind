<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧成品要求设置 -->
      <el-col :span="8">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>成品要求设置</span>
            <el-button
              style="float: right; padding: 3px 0"
              type="text"
              @click="handleSaveRequirement"
            >
              保存配置
            </el-button>
          </div>

          <el-form ref="requirementForm" :model="requirement" label-position="top">
            <el-form-item label="成品名称">
              <el-input v-model="requirement.name" placeholder="请输入成品名称" />
            </el-form-item>

            <el-form-item label="目标产量(kg)">
              <el-input-number v-model="requirement.targetAmount" :min="1" />
            </el-form-item>

            <el-form-item label="元素含量要求">
              <div v-for="(element, index) in requirement.elements" :key="index" class="element-requirement">
                <el-row :gutter="10">
                  <el-col :span="8">
                    <el-input v-model="element.name" placeholder="元素" />
                  </el-col>
                  <el-col :span="7">
                    <el-input-number
                      v-model="element.minPercentage"
                      :min="0"
                      :max="100"
                      :precision="2"
                      size="small"
                      placeholder="最小%"
                    />
                  </el-col>
                  <el-col :span="7">
                    <el-input-number
                      v-model="element.maxPercentage"
                      :min="0"
                      :max="100"
                      :precision="2"
                      size="small"
                      placeholder="最大%"
                    />
                  </el-col>
                  <el-col :span="2">
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      circle
                      @click.prevent="removeElementRequirement(index)"
                    />
                  </el-col>
                </el-row>
              </div>
              <el-button type="text" @click="addElementRequirement">
                + 添加元素要求
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧配方计算结果 -->
      <el-col :span="16">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>配方计算结果</span>
            <el-button
              style="float: right; margin-left: 10px;"
              type="primary"
              @click="calculateRecipe"
              :loading="calculating"
            >
              开始计算
            </el-button>
          </div>

          <div v-if="recipeResult">
            <el-alert
              title="计算完成"
              type="success"
              :description="'预计总成本: ¥' + recipeResult.totalCost"
              show-icon
              :closable="false"
              style="margin-bottom: 20px"
            />

            <el-table
              :data="recipeResult.materials"
              border
              style="width: 100%"
            >
              <el-table-column
                label="废料名称"
                prop="name"
                min-width="120"
              />
              <el-table-column
                label="使用量"
                width="120"
                align="center"
              >
                <template slot-scope="{row}">
                  {{ row.amount }} {{ row.unit }}
                </template>
              </el-table-column>
              <el-table-column
                label="单价"
                width="120"
                align="center"
              >
                <template slot-scope="{row}">
                  ¥{{ row.price }}/{{ row.unit }}
                </template>
              </el-table-column>
              <el-table-column
                label="成本"
                width="120"
                align="center"
              >
                <template slot-scope="{row}">
                  ¥{{ (row.amount * row.price).toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column
                label="库存状态"
                width="120"
                align="center"
              >
                <template slot-scope="{row}">
                  <el-tag :type="row.amount <= row.stock ? 'success' : 'danger'">
                    {{ row.amount <= row.stock ? '库存充足' : '库存不足' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <div class="result-composition" style="margin-top: 20px">
              <h4>预计成分构成：</h4>
              <el-table
                :data="recipeResult.composition"
                border
                style="width: 100%"
              >
                <el-table-column
                  label="元素"
                  prop="element"
                  width="120"
                />
                <el-table-column
                  label="预计含量"
                  width="120"
                  align="center"
                >
                  <template slot-scope="{row}">
                    {{ row.percentage.toFixed(2) }}%
                  </template>
                </el-table-column>
                <el-table-column
                  label="要求范围"
                  min-width="120"
                  align="center"
                >
                  <template slot-scope="{row}">
                    {{ row.minPercentage }}% - {{ row.maxPercentage }}%
                  </template>
                </el-table-column>
                <el-table-column
                  label="状态"
                  width="120"
                  align="center"
                >
                  <template slot-scope="{row}">
                    <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
                      {{ row.status === 'normal' ? '符合要求' : '不符合要求' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div style="margin-top: 20px; text-align: right">
              <el-button type="success" @click="handleApplyRecipe">
                应用配方
              </el-button>
            </div>
          </div>

          <div v-else class="empty-result">
            <el-empty description="请设置成品要求并点击计算" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Recipe',
  data() {
    return {
      requirement: {
        name: '',
        targetAmount: 100,
        elements: [
          { name: '', minPercentage: 0, maxPercentage: 100 }
        ]
      },
      calculating: false,
      recipeResult: null
    }
  },
  methods: {
    addElementRequirement() {
      this.requirement.elements.push({
        name: '',
        minPercentage: 0,
        maxPercentage: 100
      })
    },
    removeElementRequirement(index) {
      this.requirement.elements.splice(index, 1)
    },
    handleSaveRequirement() {
      // 调用后端API保存成品要求配置
      this.$notify({
        title: '成功',
        message: '成品要求配置已保存',
        type: 'success'
      })
    },
    calculateRecipe() {
      this.calculating = true
      // 调用后端API进行配方计算
      // 模拟计算过程
      setTimeout(() => {
        this.recipeResult = {
          totalCost: 1250.00,
          materials: [
            {
              name: '废铜线',
              amount: 80,
              unit: 'kg',
              price: 10,
              stock: 1000
            },
            {
              name: '废铁屑',
              amount: 20,
              unit: 'kg',
              price: 5,
              stock: 15
            }
          ],
          composition: [
            {
              element: 'Cu',
              percentage: 75,
              minPercentage: 70,
              maxPercentage: 80,
              status: 'normal'
            },
            {
              element: 'Fe',
              percentage: 25,
              minPercentage: 20,
              maxPercentage: 30,
              status: 'normal'
            }
          ]
        }
        this.calculating = false
      }, 2000)
    },
    handleApplyRecipe() {
      this.$confirm('应用该配方将自动扣减相应库存，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用后端API应用配方
        this.$notify({
          title: '成功',
          message: '配方已应用，库存已更新',
          type: 'success'
        })
      })
    }
  }
}
</script>

<style scoped>
.element-requirement {
  margin-bottom: 10px;
}
.empty-result {
  padding: 40px 0;
}
</style>
