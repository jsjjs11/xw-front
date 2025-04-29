<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="900px">
      <el-form ref="formRef" :model="formData" :rules="rules" :inline="true" label-position="left">
        <!-- 权限组名称 -->
        <el-form-item label="权限组名称" prop="groupName">
          <el-input v-model="formData.groupName" placeholder="请输入权限组名称" style="width: 200px" />
        </el-form-item>

        <!-- 权限类型 -->
        <el-form-item label="权限类型" prop="authType">
          <el-select v-model="formData.authType" placeholder="请选择权限类型" clearable style="width: 200px">
            <el-option v-for="dict in authTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" icon="el-icon-user" @click="handlePersonAuth">人员授权</el-button>
        <el-button type="info" icon="el-icon-edit" @click="handleRegisterAuth">注销授权</el-button>
      </div>

      <!-- 权限列表表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px;">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="lineName" label="线路名称" align="center" />
        <el-table-column prop="groupName" label="权限组名称" align="center" />
        <el-table-column prop="authType" label="权限类型" align="center">
          <template v-slot="scope">
            <dict-tag :type="DICT_TYPE.NACS_AUTH_TYPE" :value="scope.row.authType" />
          </template>
        </el-table-column>
        <el-table-column prop="authMode" label="权限模式" align="center">
          <template v-slot="scope">
            <dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
          </template>
        </el-table-column>
        <el-table-column prop="isPublic" label="预设公共权限" align="center">
          <template v-slot="scope">
            {{ scope.row.isPublic ? '是' : '否' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
        @pagination="getList" />

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'AuthorizeForm',
  data() {
    return {
      // 遮罩层
      loading: false,
      // 显示状态
      visible: false,
      // 标题
      title: '权限授权',
      // 表单数据
      formData: {
        groupName: '',
        authType: undefined
      },
      // 表单校验规则
      rules: {
        groupName: [
          { required: true, message: '权限组名称不能为空', trigger: 'blur' }
        ],
        authType: [
          { required: true, message: '请选择权限类型', trigger: 'change' }
        ]
      },
      // 权限类型选项
      authTypeOptions: [],
      // 表格数据
      tableData: [{
        lineName: '2号线',
        groupName: '世界之窗站...',
        authType: '门禁权限',
        authMode: '0',
        isPublic: false
      },],
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10
      },
      // 字典定义
      DICT_TYPE
    }
  },
  methods: {
    /** 显示弹框 */
    show() {
      this.visible = true
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.formData = {
        groupName: '',
        authType: undefined
      }
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields()
      }
    },
    /** 取消按钮 */
    cancel() {
      this.visible = false
      this.reset()
    },
    /** 人员授权 */
    handlePersonAuth() {
      // TODO: 实现人员授权逻辑
    },
    /** 注销授权 */
    handleRegisterAuth() {
      // TODO: 实现注销授权逻辑
    },
    /** 查询列表 */
    async getList() {
      try {
        this.loading = true
        // TODO: 调用接口获取数据
        // const response = await getAuthList(this.queryParams)
        // this.tableData = response.data.list
        // this.total = response.data.total
      } catch (error) {
        console.error('获取权限列表失败', error)
        this.$modal.msgError('获取权限列表失败')
      } finally {
        this.loading = false
      }
    },
    /** 提交表单 */
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (!valid) return
        try {
          this.loading = true
          // TODO: 调用保存接口
          // await saveAuth(this.formData)
          this.$modal.msgSuccess('保存成功')
          this.visible = false
          this.$emit('success')
        } catch (error) {
          console.error('保存失败', error)
          this.$modal.msgError('保存失败')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.operation-buttons {
  margin: 20px 0;
}

.operation-buttons .el-button {
  margin-right: 10px;
}

.dialog-footer {
  text-align: center;
}

</style>
