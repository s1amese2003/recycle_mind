<template>
  <div class="user-manage-container">
    <el-card>
      <div class="toolbar">
        <el-button type="primary" @click="openAddDialog">添加用户</el-button>
        <el-button @click="loadUsers">刷新</el-button>
      </div>
      <el-table :data="users" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="is_active" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'info'">
              {{ scope.row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteUser(scope.row)">删除</el-button>
            <el-button size="mini" type="warning" @click="resetPassword(scope.row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <user-edit-dialog
      v-if="editDialogVisible"
      :visible.sync="editDialogVisible"
      :user="editUser"
      :is-add="isAdd"
      @save="saveUser"
    />
  </div>
</template>

<script>
import UserEditDialog from '@/components/UserEditDialog.vue'
import { getUsers } from '@/api/user-manage'

export default {
  name: 'UserManage',
  components: { UserEditDialog },
  data() {
    return {
      users: [],
      editDialogVisible: false,
      editUser: null,
      isAdd: false
    }
  },
  created() {
    this.loadUsers()
  },
  methods: {
    loadUsers() {
      getUsers().then(response => {
        this.users = response.data
        this.$message.success('用户数据已刷新')
      })
    },
    openAddDialog() {
      this.editUser = { username: '', password: '', role: 'viewer', email: '', is_active: true }
      this.isAdd = true
      this.editDialogVisible = true
    },
    openEditDialog(user) {
      this.editUser = { ...user }
      this.isAdd = false
      this.editDialogVisible = true
    },
    saveUser(user) {
      if (this.isAdd) {
        user.id = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1
        this.users.push(user)
        this.$message.success('添加用户成功')
      } else {
        const idx = this.users.findIndex(u => u.id === user.id)
        if (idx !== -1) {
          this.users.splice(idx, 1, user)
          this.$message.success('编辑用户成功')
        }
      }
      this.editDialogVisible = false
    },
    deleteUser(user) {
      this.$confirm(`确定要删除用户 ${user.username} 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.users = this.users.filter(u => u.id !== user.id)
        this.$message.success('删除用户成功')
      }).catch(() => {})
    },
    resetPassword(user) {
      this.$prompt('请输入新密码', '重置密码', {
        inputType: 'password',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        // 实际开发中应请求后端API
        this.$message.success(`用户 ${user.username} 密码已重置为：${value}`)
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.user-manage-container {
  padding: 20px;
}
.toolbar {
  margin-bottom: 15px;
}
</style>
