<template>
	<div>
		<el-dialog :title="title" :visible.sync="visible" width="900px" :close="close">
			<!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" icon="el-icon-user" @click="showAuthDrawer()">部门预设权限授权</el-button>
        <el-button type="info" icon="el-icon-edit" @click="handleRegisterAuth(scope.row)">注销授权</el-button>
      </div>
      <!-- 权限列表表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px;">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="lineName" label="线路名称" align="center" width="150"/>
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
		</el-dialog>
		<group-detail-form ref="groupDetailFormRef"/>
		<authorize-drawer ref="authorizeDrawerRef"/>
	</div>
</template>
<script>
import { DICT_TYPE, getLineDatas, getDictDatas } from '@/utils/dict';
import groupDetailForm from '@/views/system/user/authorize/groupDetailForm.vue';
import AuthorizeDrawer from '@/views/system/user/authorize/authorizeDrawer.vue';
import * as deptAuthApi from '@/api/nacs/department_auth';
export default {
	name: 'DeptAuthForm',
	components: { groupDetailForm, AuthorizeDrawer },
	data() {
		return {
      lineMap: getLineDatas(),
      // 遮罩层
      loading: false,
      // 显示状态
      visible: false,
      // 标题
      title: '部门权限',
      // 表格数据
      tableData: [],
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        deptId: undefined,
      },
			idCards: [],
      // 字典定义
      DICT_TYPE,
      // 抽屉显示状态
      drawerVisible: false,
      // 当前选中的权限组
      currentGroup: {},
		}
	},
	methods: {
		/** 显示弹框 */
    async show(row) {
			console.log(row);
			if(row.status === 0) {
				this.visible = true;
				this.queryParams.deptId = row.id;
      	await this.getList()
			} else {
				this.$message.error('该部门未启用，无法查看权限');
			}
    },
    /** 关闭弹框 */
		close() {
			this.visible = false
		},
		/** 注销授权 */
    async handleRegisterAuth(row) {
      // TODO: 实现注销授权逻辑
      try {
        await this.$modal.confirm('确认注销该权限的授权吗？')
        this.loading = true
        // await AuthorizationApi.deleteCardPermissionsList(row.id)
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
		/** 查询列表 */
    async getList() {
      try {
        this.loading = true;
        // TODO: 调用接口获取数据
				console.log(this.queryParams);
        const response = await deptAuthApi.deptPermissionPage(this.queryParams);
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
		/** 显示权限组详情 */
    async showGroupDetails(row) {
      this.$refs.groupDetailFormRef.showGroupDetails(row);
    },
		/** 显示授权抽屉 */
    async showAuthDrawer() {
			const lineInfo = this.lineMap.map(line => line.lineNo);
			this.$refs["authorizeDrawerRef"].showAuthDialog(this.idCards, this.queryParams.deptId, lineInfo);
    },
	}
}
</script>
<style lang="scss" scoped>
.operation-buttons {
  margin: 0px 0;
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
    height: 260px !important;
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