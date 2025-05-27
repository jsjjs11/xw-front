<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="900px">
      <el-form ref="formRef" :model="formData" :rules="rules" :inline="true" label-position="left">
        <!-- 权限组名称 -->
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入权限名称" style="width: 200px" />
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
        <el-button type="primary" icon="el-icon-user" @click="showAuthDrawer">人员授权</el-button>
        <el-button type="info" icon="el-icon-edit" @click="handleRegisterAuth(scope.row)">注销授权</el-button>
      </div>

      <!-- 权限列表表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px;">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="lineName" label="线路名称" align="center" />
        <el-table-column prop="name" label="权限名称" align="center">
          <template v-slot="scope">
            <span
              v-if="scope.row.authMode === '0'"
              class="clickable-group-name"
              @click="showGroupDetails(scope.row)">
              {{ scope.row.name }}
            </span>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
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

      <!-- 权限组详情抽屉 -->
      <el-drawer
        :title="currentGroup.groupName + ' - 门禁点列表'"
        :visible.sync="drawerVisible"
        direction="rtl"
        size="50%"
        :modal="true"
        :append-to-body="true"
        :modal-append-to-body="false"
        :destroy-on-close="true">
        <el-table :data="accessPointList" style="width: 100%">
          <el-table-column prop="deviceName" label="门禁点名称" align="center" />
          <el-table-column prop="deviceId" label="设备编号" align="center" />
          <el-table-column prop="lineNo" label="线路ID" align="center" />
          <el-table-column prop="groupCode" label="权限组编码" align="center" />
        </el-table>
      </el-drawer>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <authorize-drawer ref="authorizeDrawerRef"/>
  </div>
</template>

<script>
import { DICT_TYPE, getLineDatas, getDictDatas } from '@/utils/dict'
import * as AuthorizationApi from '@/api/nacs/authorize'
import AuthorizeDrawer from '@/views/system/user/authorize/authorizeDrawer.vue'
export default {
  name: 'AuthorizeForm',
  components: { AuthorizeDrawer},
  data() {
    return {
      lineMap: getLineDatas(),
      // 遮罩层
      loading: false,
      // 显示状态
      visible: false,
      // 标题
      title: '权限授权',
      // 表单数据
      formData: {
        name: '',
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
      authTypeOptions: getDictDatas(DICT_TYPE.NACS_AUTH_MODE),
      // 表格数据
      tableData: [{
        lineName: '2号线',
        groupName: '世界之窗站门禁组',
        authType: '门禁权限',
        authMode: '0',
        isPublic: false
      }, {
          lineName: '1号线',
          groupName: '站台门',
          authType: '门禁权限',
          authMode: '1',
          isPublic: false
        }],
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        idCard: undefined,
      },
      // 字典定义
      DICT_TYPE,
      // 抽屉显示状态
      drawerVisible: false,
      // 当前选中的权限组
      currentGroup: {},
      // 门禁点列表
      accessPointList: [
        {
          id: 1,
          lineNo: 'SZM2',
          groupCode: 'WJC_GROUP',
          deviceId: 'WJC_GATE_01',
          deviceName: '世界之窗站1号闸机'
        },
        {
          id: 2,
          lineNo: 'SZM2',
          groupCode: 'WJC_GROUP',
          deviceId: 'WJC_GATE_02',
          deviceName: '世界之窗站2号闸机'
        },
        {
          id: 3,
          lineNo: 'SZM2',
          groupCode: 'WJC_GROUP',
          deviceId: 'WJC_DOOR_01',
          deviceName: '世界之窗站站厅门'
        }
      ],
    }
  },
  methods: {
    /** 显示弹框 */
    async show(form) {
      this.visible = true
      this.reset()
      this.queryParams.idCard = form.idCard;
      await this.getList()
    },
    /** 表单重置 */
    reset() {
      this.formData = {
        name: '',
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
    async handleRegisterAuth(row) {
      // TODO: 实现注销授权逻辑
      try {
        await this.$modal.confirm('确认注销该权限的授权吗？')
        this.loading = true
        await AuthorizationApi.deleteCardPermissionsList(row.id)
        this.$modal.msgSuccess("该权限已申请注销")
        await this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$modal.msgError('申请注销权限失败')
        }
        console.error("申请注销权限失败", error)
      } finally {
        this.loading = false
      }
    },
    /** 查询按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    handleReset() {
      this.formData.name = '';
      this.formData.authType = undefined;
      if (this.$refs.formRef) {
        this.$refs.formRef.resetFields();
      }
      this.handleQuery();
    },

    /** 查询列表 */
    async getList() {
      try {
        this.loading = true;
        // TODO: 调用接口获取数据
        const response = await AuthorizationApi.getCardPermissionsListPage(this.queryParams);
        // 处理返回数据，设置name字段
        this.tableData = response.data.list.map(item => ({
            ...item,
            name: item.name, 
            lineName: this.lineMap.find(line => line.lineNo === item.lineNo).name
        }));
        // console.log(this.lineMap)
        this.total = response.data.total;
        // console.log('tableData', this.tableData);
      } catch (error) {
        console.error('获取权限列表失败', error);
        this.$modal.msgError('获取权限列表失败');
      } finally {
        this.loading = false;
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
    },
    /** 显示权限组详情 */
    async showGroupDetails(row) {
      this.currentGroup = row;
      this.drawerVisible = true;
      await this.getAccessPoints(row.groupCode); // 使用groupCode作为查询条件
    },

    /** 获取门禁点列表 */
    async getAccessPoints(groupCode) {
      try {
        this.loading = true;
        //const response = await deviceGroupApi.getDGroupDevices(groupCode);
        //this.accessPointList = response.data;
      } catch (error) {
        console.error('获取门禁点列表失败', error);
        this.$modal.msgError('获取门禁点列表失败');
      } finally {
        this.loading = false;
      }
    },

    /** 显示授权抽屉 */
    async showAuthDrawer() {
      try {
        const params = [this.queryParams.idCard];
        const response = await AuthorizationApi.checkApply(params);
        if (response.data.length === 0) {
          this.$refs["authorizeDrawerRef"].showAuthDialog(this.queryParams.idCard, this.total);
        } else {
          this.$modal.msgError('您已申请过权限，请等待管理员审核');
        }
      } catch (error) {
        console.error('检查是否有未审核的权限申请失败', error);
      }
    },

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

.clickable-group-name {
  color: #409EFF;
  text-decoration: underline;
  cursor: pointer;
}

.clickable-group-name:hover {
  opacity: 0.8;
}

.auth-drawer-content {
  display: flex;
  padding: 20px;
  height: calc(100% - 100px);
}

.left-panel, .right-panel {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.center-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
}

.panel-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #606266;
}

.search-area {
  margin-bottom: 16px;
}

.search-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.search-item .label {
  width: 80px;
  text-align: right;
  margin-right: 8px;
}

.button-group {
  margin-top: 8px;
  text-align: right;
}

.transfer-btn {
  margin: 8px 0;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  text-align: right;
  border-top: 1px solid #e8e8e8;
}

::v-deep .el-drawer__body {
  height: 100%;
  overflow: hidden;
}

::v-deep .el-table {
  flex: 1;
  overflow: auto;
}
</style>
