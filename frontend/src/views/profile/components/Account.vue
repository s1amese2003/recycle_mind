<template>
  <el-form>
    <el-form-item label="姓名">
      <el-input v-model.trim="user.name" />
    </el-form-item>
    <el-form-item label="年龄">
      <el-input v-model.trim="user.age" />
    </el-form-item>
    <el-form-item label="部门">
      <el-input v-model.trim="user.department" />
    </el-form-item>
    <el-form-item label="联系电话">
      <el-input v-model.trim="user.phone" />
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model.trim="user.email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">更新</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: '',
          age: '',
          department: '',
          phone: ''
        }
      }
    }
  },
  methods: {
    submit() {
      this.$message({
        message: '用户信息更新成功',
        type: 'success',
        duration: 5 * 1000
      })
    }
  }
}
</script>
