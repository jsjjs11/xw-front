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
        <el-button type="primary" icon="el-icon-user" @click="showAuthDrawer">人员授权</el-button>
        <el-button type="info" icon="el-icon-edit" @click="handleRegisterAuth">注销授权</el-button>
      </div>

      <!-- 权限列表表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px;">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="lineName" label="线路名称" align="center" />
        <el-table-column prop="groupName" label="权限组名称" align="center">
          <template v-slot="scope">
            <span 
              v-if="scope.row.authMode === '0'" 
              class="clickable-group-name"
              @click="showGroupDetails(scope.row)">
              {{ scope.row.groupName }}
            </span>
            <span v-else>{{ scope.row.groupName }}</span>
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
          <el-table-column prop="lineId" label="线路ID" align="center" />
          <el-table-column prop="groupCode" label="权限组编码" align="center" />
        </el-table>
      </el-drawer>

      <!-- 人员授权抽屉 -->
      <el-drawer
        title="人员授权"
        :visible.sync="authDrawerVisible"
        direction="rtl"
        size="80%"
        :modal="true"
        :append-to-body="true"
        :modal-append-to-body="false"
        :destroy-on-close="true">
        <div class="auth-drawer-content">
          <!-- 左侧权限组 -->
          <div class="left-panel">
            <div class="panel-title">权限组</div>
            <div class="search-area">
              <div class="search-item">
                <span class="label">线路</span>
                <el-select v-model="leftForm.lineId" placeholder="3号线" size="small">
                  <el-option label="3号线" value="3" />
                </el-select>
              </div>
              <div class="search-item">
                <span class="label">权限组</span>
                <el-input v-model="leftForm.groupName" placeholder="请输入权限组名称" size="small" />
              </div>
              <div class="button-group">
                <el-button type="primary" size="small" icon="el-icon-search" @click="handleLeftSearch">查询</el-button>
                <el-button size="small" icon="el-icon-refresh" @click="handleLeftReset">重置</el-button>
              </div>
            </div>
            <!-- 权限组列表 -->
            <el-table :data="leftTableData" style="width: 100%" @selection-change="handleLeftSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="groupName" label="权限组名称" />
              <el-table-column prop="lineName" label="线路" />
              <el-table-column prop="authType" label="权限类型" />
              <el-table-column prop="authMode" label="权限模式" />
            </el-table>
          </div>

          <!-- 中间按钮区 -->
          <div class="center-panel">
            <el-button type="primary" class="transfer-btn" @click="handleTransferRight">>></el-button>
            <el-button type="primary" class="transfer-btn" @click="handleTransferLeft"><<</el-button>
          </div>

          <!-- 右侧权限组 -->
          <div class="right-panel">
            <div class="panel-title">权限组</div>
            <div class="search-area">
              <div class="search-item">
                <span class="label">权限组名称</span>
                <el-input v-model="rightForm.groupName" placeholder="请输入权限组名称" size="small" />
              </div>
              <div class="search-item">
                <span class="label">权限类型</span>
                <el-select v-model="rightForm.authType" placeholder="请选择" size="small" clearable>
                  <el-option label="门禁权限" value="1" />
                </el-select>
              </div>
              <el-button type="primary" size="small" icon="el-icon-search" @click="handleRightSearch">查询</el-button>
            </div>
            <!-- 右侧表格 -->
            <el-table :data="rightTableData" style="width: 100%" @selection-change="handleRightSelectionChange">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="groupName" label="权限组..." />
              <el-table-column prop="lineName" label="线路" />
              <el-table-column prop="authType" label="权限类型" />
              <el-table-column prop="authMode" label="权限模式" />
            </el-table>
          </div>
        </div>
        <div class="drawer-footer">
          <el-button @click="authDrawerVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleAuthConfirm">确 定</el-button>
        </div>
      </el-drawer>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
//import * as deviceGroupApi from '@/api/nacs/d_groups' // 假设API路径
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
        pageSize: 10
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
          lineId: 'SZM2',
          groupCode: 'WJC_GROUP',
          deviceId: 'WJC_GATE_01',
          deviceName: '世界之窗站1号闸机'
        },
        {
          id: 2,
          lineId: 'SZM2',
          groupCode: 'WJC_GROUP',
          deviceId: 'WJC_GATE_02',
          deviceName: '世界之窗站2号闸机'
        },
        {
          id: 3,
          lineId: 'SZM2',
          groupCode: 'WJC_GROUP',
          deviceId: 'WJC_DOOR_01',
          deviceName: '世界之窗站站厅门'
        }
      ],
      // 人员授权抽屉显示状态
      authDrawerVisible: false,
      // 左侧表单数据
      leftForm: {
        lineId: '3',
        groupName: ''
      },
      // 右侧表单数据
      rightForm: {
        groupName: '',
        authType: ''
      },
      // 左侧表格数据
      leftTableData: [{
        groupName: '龙岗线',
        lineName: '3号线',
        authType: '门禁权限',
        authMode: '门禁V系列'
      }],
      // 右侧表格数据
      rightTableData: [],
      // 选中的数据
      leftSelection: [],
      rightSelection: []
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
    /** 查询按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    handleReset() {
      this.formData.groupName = '';
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
        // const response = await getAuthList({
        //   ...this.queryParams,
        //   groupName: this.formData.groupName,
        //   authType: this.formData.authType
        // });
        // this.tableData = response.data.list;
        // this.total = response.data.total;
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
    showAuthDrawer() {
      this.authDrawerVisible = true;
      this.getLeftTableData();
    },

    /** 获取左侧表格数据 */
    async getLeftTableData() {
      // TODO: 调用API获取数据
    },

    /** 左侧查询 */
    handleLeftSearch() {
      this.getLeftTableData();
    },

    /** 左侧重置 */
    handleLeftReset() {
      this.leftForm = {
        lineId: '3',
        groupName: ''
      };
      this.getLeftTableData();
    },

    /** 右侧查询 */
    handleRightSearch() {
      this.getRightTableData();
    },

    /** 获取右侧表格数据 */
    async getRightTableData() {
      // TODO: 调用API获取数据
    },

    /** 处理左侧表格选择变化 */
    handleLeftSelectionChange(selection) {
      this.leftSelection = selection;
    },

    /** 处理右侧表格选择变化 */
    handleRightSelectionChange(selection) {
      this.rightSelection = selection;
    },

    /** 向右传输 */
    handleTransferRight() {
      // TODO: 实现向右传输逻辑
    },

    /** 向左传输 */
    handleTransferLeft() {
      // TODO: 实现向左传输逻辑
    },

    /** 确认授权 */
    handleAuthConfirm() {
      // TODO: 实现确认授权逻辑
      this.authDrawerVisible = false;
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
