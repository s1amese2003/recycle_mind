<template>
  <el-dialog :title="isAdd ? '添加用户' : '编辑用户'" :visible.sync="visible" width="400px" @close="handleClose">
    <el-form :model="form" :rules="rules" ref="userForm" label-width="70px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" autocomplete="off" />
      </el-form-item>
      <el-form-item v-if="isAdd" label="密码" prop="password">
        <el-input v-model="form.password" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option label="管理员" value="admin" />
          <el-option label="操作员" value="operator" />
          <el-option label="只读" value="viewer" />
        </el-select>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" autocomplete="off" />
      </el-form-item>
      <el-form-item label="状态" prop="is_active">
        <el-switch v-model="form.is_active" active-text="启用" inactive-text="禁用" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserEditDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    user: {
      type: Object,
      default: () => ({})
    },
    isAdd: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: { ...this.user },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    user: {
      handler(val) {
        this.form = { ...val }
      },
      deep: true,
      immediate: true
    },
    visible(val) {
      if (!val) {
        this.$refs.userForm && this.$refs.userForm.resetFields()
      }
    }
  },
  methods: {
    handleSave() {
      this.$refs.userForm.validate(valid => {
        if (!valid) return
        this.$emit('save', { ...this.form })
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