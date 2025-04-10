<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="权限集标识" prop="setId">
        <el-input v-model="queryParams.setId" placeholder="请输入权限集标识" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="权限集名称" prop="setName">
        <el-input v-model="queryParams.setName" placeholder="请输入权限集名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
                   v-hasPermi="['nacs:permission-set:create']">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="权限集编号" align="center" prop="id" />
      <el-table-column label="权限集标识" align="center" prop="setId" />
      <el-table-column label="权限集名称" align="center" prop="setName" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['nacs:permission-set:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['nacs:permission-set:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <PermissionSetForm ref="formRef" @success="getList"/>
  </div>
</template>

<script>
import { getPermissionSetPage, deletePermissionSet } from '@/api/nacs/permission_set/index.js'
import PermissionSetForm from './components/PermissionSetForm.vue'

export default {
  name: "PermissionSet",
  components: { PermissionSetForm },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 权限集列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        setId: null,
        setName: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    async getList() {
      try {
        this.loading = true
        // 模拟后端返回的数据
        const mockData = {
          code: 0,
          data: {
            list: [
              {
                id: 1,
                setId: 'ADMIN',
                setName: '管理员权限集',
                remark: '系统管理员的权限集合',
                createTime: '2024-03-20 10:00:00',
                updateTime: '2024-03-20 10:00:00',
                creator: 'admin',
                updater: 'admin'
              },
              {
                id: 2,
                setId: 'USER',
                setName: '普通用户权限集',
                remark: '普通用户的基础权限集合',
                createTime: '2024-03-20 11:00:00',
                updateTime: '2024-03-20 11:00:00',
                creator: 'admin',
                updater: 'admin'
              },
              {
                id: 3,
                setId: 'GUEST',
                setName: '访客权限集',
                remark: '访客的只读权限集合',
                createTime: '2024-03-20 12:00:00',
                updateTime: '2024-03-20 12:00:00',
                creator: 'admin',
                updater: 'admin'
              }
            ],
            total: 3
          },
          msg: "查询成功"
        }

        // 如果有搜索条件，进行本地过滤（实际应该由后端处理）
        if (this.queryParams.setId || this.queryParams.setName) {
          mockData.data.list = mockData.data.list.filter(item => {
            const matchSetId = !this.queryParams.setId || 
              item.setId.toLowerCase().includes(this.queryParams.setId.toLowerCase())
            const matchSetName = !this.queryParams.setName || 
              item.setName.toLowerCase().includes(this.queryParams.setName.toLowerCase())
            return matchSetId && matchSetName
          })
          mockData.data.total = mockData.data.list.length
        }

        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300))

        // const res = await getPermissionSetPage(this.queryParams)
        this.list = mockData.data.list
        this.total = mockData.data.total
      } finally {
        this.loading = false
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$refs["formRef"].open()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.$refs["formRef"].open(row.id)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除权限集编号为"' + id + '"的数据项?').then(() => {
        return deletePermissionSet(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    }
  }
}
</script> 