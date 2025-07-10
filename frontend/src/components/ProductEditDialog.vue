<template>
  <el-dialog :title="!form.id ? '添加产品' : '编辑产品'" :visible.sync="dialogVisible" width="900px" @close="handleClose">
    <el-form :model="form" :rules="rules" ref="productForm" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="客户名称" prop="customer_name">
            <el-input v-model="form.customer_name" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="牌号" prop="model_number">
            <el-input v-model="form.model_number" autocomplete="off" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="产品分类" prop="category">
        <el-select v-model="form.category" placeholder="请选择分类" style="width: 200px">
          <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
        </el-select>
      </el-form-item>
      <el-row :gutter="10">
        <el-col :span="8" v-for="metal in metals" :key="metal.key">
          <el-form-item :label="metal.label">
            <el-input-number v-model="form[metal.key].min" :precision="3" :step="0.01" :min="0" :max="100" style="width: 110px" placeholder="最小" />
            <span style="margin: 0 4px;">-</span>
            <el-input-number v-model="form[metal.key].max" :precision="3" :step="0.01" :min="0" :max="100" style="width: 110px" placeholder="最大" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
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
      default: false
    },
    product: {
      type: Object,
      default: () => ({})
    },
    categories: {
      type: Array,
      default: () => []
    },
    metals: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: this.visible,
      form: {},
      rules: {
        customer_name: [
          { required: true, message: '请输入客户名称', trigger: 'blur' }
        ],
        model_number: [
          { required: true, message: '请输入牌号', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择产品分类', trigger: 'change' }
        ]
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.form = JSON.parse(JSON.stringify(this.product))
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    handleSave() {
      this.$refs.productForm.validate(valid => {
        if (valid) {
          for (const metal of this.metals) {
            const key = metal.key
            const min = this.form[key].min
            const max = this.form[key].max
            if (min !== null && max !== null && Number(min) > Number(max)) {
              this.$message.error(`${metal.label} 的最小值不能大于最大值！`)
              return
            }
          }
          this.$emit('save', this.form)
          this.close()
        }
      })
    },
    close() {
      this.dialogVisible = false
    },
    handleClose() {
      this.close()
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
.el-input-number {
  width: 120px !important;
}
</style>
