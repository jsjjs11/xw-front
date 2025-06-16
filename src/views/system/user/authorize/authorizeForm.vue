<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="900px">
      <el-form ref="formRef" :model="queryParams" :rules="rules" :inline="true" label-position="left">
        <!-- 权限组名称 -->
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入权限名称" style="width: 200px" />
        </el-form-item>

        <!-- 权限类型 -->
        <el-form-item label="权限模式" prop="authMode">
          <el-select v-model="queryParams.authMode" placeholder="请选择权限模式" clearable style="width: 200px">
            <el-option v-for="dict in authModeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-table-column prop="lineName" label="线路名称" align="center" width="100"/>
        <el-table-column prop="name" label="权限名称" align="center" width="230">
          <template v-slot="scope">
            <el-link
              v-if="scope.row.authMode === 2"
              class="clickable-group-name"
              @click="showGroupDetails(scope.row)" style="text-decoration: underline;">
              {{ scope.row.name }}
              <i class="el-icon-view el-icon--right"></i>
          </el-link>
            <span v-else>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="authCate" label="权限类别" align="center">
          <template v-slot="scope">
            <dict-tag :type="DICT_TYPE.NACS_AUTH_CATE" :value="scope.row.authCate" />
          </template>
        </el-table-column>
        <el-table-column prop="authMode" label="权限模式" align="center">
          <template v-slot="scope">
            <dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
          </template>
        </el-table-column>
        <el-table-column prop="authSource" label="权限来源" align="center">
          <template v-slot="scope">
            <dict-tag :type="DICT_TYPE.NACS_AUTH_SOURCE" :value="scope.row.authSource" />
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
        @pagination="getList" />
      <!-- <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div> -->
    </el-dialog>
    <authorize-drawer ref="authorizeDrawerRef"/>
    <group-detail-form ref="groupDetailFormRef"/>
  </div>
</template>

<script>
import { DICT_TYPE, getLineDatas, getDictDatas } from '@/utils/dict'
import * as AuthorizationApi from '@/api/nacs/authorize'
import AuthorizeDrawer from '@/views/system/user/authorize/authorizeDrawer.vue'
import groupDetailForm from '@/views/system/user/authorize/groupDetailForm.vue'
import * as CardApi from '@/api/nacs/cards'
export default {
  name: 'AuthorizeForm',
  components: { AuthorizeDrawer , groupDetailForm },
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
        authMode: undefined
      },
      // 表单校验规则
      rules: {
        // name: [
        //   { required: true, message: '权限组名称不能为空', trigger: 'blur' }
        // ],
        // authMode: [
        //   { required: true, message: '请选择权限类型', trigger: 'change' }
        // ]
      },
      // 权限类型选项
      authModeOptions: getDictDatas(DICT_TYPE.NACS_AUTH_MODE),
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
        name: undefined,
        authMode: undefined,
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
        authMode: undefined
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
      this.formData.authMode = undefined;
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
      // this.currentGroup = row;
      // this.drawerVisible = true;
      // await this.getAccessPoints(row.groupCode); // 使用groupCode作为查询条件
      this.$refs.groupDetailFormRef.showGroupDetails(row);
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
        const responseCard = await CardApi.isCardActive(params);
        if (responseCard.data === false) {
          this.$modal.msgError('该用户的门禁卡未激活，请先激活卡');
          return;
        }
        const response = await AuthorizationApi.checkApply(params);
        if (response.data.length === 0) {
          const response2 = await CardApi.getLineInfo(params);
          let lineInfo = [];
          if (response2.data[0].cardSource === 1) {
            lineInfo = response2.data ? response2.data[0].lineInfo ? response2.data[0].lineInfo : [] : [];
            console.log(lineInfo);
          } else if (response2.data[0].cardSource === 0) {
            const userLineNos = response2.data[0].lineInfo || [];
            if (userLineNos.length === 0) {
              lineInfo = [];
            } else {
              // 获取所有线路号
              const allLineNos = this.lineMap.map(line => line.lineNo);
              // 计算差集：所有线路号 - 用户已有线路号
              lineInfo = allLineNos.filter(lineNo => !userLineNos.includes(lineNo));
            }
          }
          const deptId = [];
          this.$refs["authorizeDrawerRef"].showAuthDialog(this.queryParams.idCard, deptId, lineInfo);
        } else {
          this.$modal.msgError('该用户存在未审核的权限申请，请等待管理员审核');
        }
      } catch (error) {
        console.error('检查是否有未审核的权限申请失败', error);
      }
    },

  }
}
</script>

<style lang="scss" scoped>
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

::v-deep .el-table {
  flex: 1;
  // overflow: hidden;
  overflow-y:auto;
  height: 400px !important;
  .el-table__body-wrapper {
    overflow-y:auto;
    height: 320px !important;
  }
}
::v-deep .el-dialog {
  height: auto !important;
  overflow: visible !important;
  
  .el-dialog__body {
    overflow: visible !important;
    max-height: none !important;
    padding:30px 20px 40px 20px;
  }
}

</style>
