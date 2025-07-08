<template>
  <el-dialog :title="isAdd ? '添加产品' : '编辑产品'" :visible.sync="visible" width="900px" @close="handleClose">
    <el-form :model="form" :rules="rules" ref="productForm" label-width="100px">
      <el-form-item label="产品名称" prop="name">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="产品分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 200px">
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="8" v-for="metal in metals" :key="metal">
          <el-form-item :label="metal + '含量(%)'">
            <el-input-number v-model="form[metal].min" :min="0" :max="100" :step="0.01" style="width: 120px" placeholder="最小" />
            <span style="margin: 0 4px;">~</span>
            <el-input-number v-model="form[metal].max" :min="0" :max="100" :step="0.01" style="width: 120px" placeholder="最大" />
            <div style="font-size: 12px; color: #888; margin-top: 4px;">
              产品的含量范围 {{ form[metal].min }}% ~ {{ form[metal].max }}%
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ProductEditDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    product: {
      type: Object,
      default: () => ({})
    },
    isAdd: {
      type: Boolean,
      default: false
    },
    metals: {
      type: Array,
      required: true
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: { ...this.product },
      rules: {
        name: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择产品分类', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    product: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true,
      immediate: true
    },
    visible(val) {
      if (!val) {
        this.$refs.productForm && this.$refs.productForm.resetFields()
      }
    }
  },
  methods: {
    handleSave() {
      // 校验最小值不能超过最大值
      for (const metal of this.metals) {
        if (Number(this.form[metal].min) > Number(this.form[metal].max)) {
          this.$message.error(`${metal} 的最小值不能大于最大值！`)
          return
        }
      }
      this.$refs.productForm.validate(valid => {
        if (!valid) return
        // 智能成分校验
        this.$emit('validate', { ...this.form }, (pass, msg) => {
          if (!pass) {
            this.$message.error(msg || '成分区间校验未通过')
            return
          }
          this.$emit('save', { ...this.form })
        })
      })
    },
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style> 