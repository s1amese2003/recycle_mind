<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">用户登录</h2>
      <el-form :model="form" :rules="rules" ref="loginForm" label-width="60px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'UserLogin',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      mockUsers: [
        { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@example.com', is_active: true },
        { id: 2, username: 'operator', password: 'op123', role: 'operator', email: 'op@example.com', is_active: true }
      ]
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return
        const user = this.mockUsers.find(u => u.username === this.form.username && u.password === this.form.password && u.is_active)
        if (user) {
          this.$message.success('登录成功')
          // 登录成功后跳转到首页或用户管理
          this.$router.push({ path: '/user' })
        } else {
          this.$message.error('用户名或密码错误，或账号已禁用')
        }
      })
    },
    handleRegister() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return
        const exists = this.mockUsers.some(u => u.username === this.form.username)
        if (exists) {
          this.$message.error('用户名已存在')
        } else {
          this.mockUsers.push({
            id: this.mockUsers.length + 1,
            username: this.form.username,
            password: this.form.password,
            role: 'viewer',
            email: '',
            is_active: true
          })
          this.$message.success('注册成功，请登录')
          this.form.username = ''
          this.form.password = ''
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6fa;
}
.login-card {
  width: 350px;
  padding: 30px 20px 20px 20px;
}
.login-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: bold;
}
</style> 