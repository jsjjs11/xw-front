<template>
	<div>
		<el-dialog :title="title" :visible.sync="visible" width="900px" :close="close">
			<!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" icon="el-icon-user" @click="showAuthDrawer()">部门预设权限管理</el-button>
        <!-- <el-button type="info" icon="el-icon-edit" @click="handleRegisterAuth(scope.row)">注销授权</el-button> -->
        <el-button type="primary" icon="el-icon-s-promotion" @click="handleGrandAuth()">下发权限</el-button>
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
        <!-- <el-table-column prop="authSource" label="权限来源" align="center">
          <template v-slot="scope">
            <dict-tag :type="DICT_TYPE.NACS_AUTH_SOURCE" :value="scope.row.authSource" />
          </template>
        </el-table-column> -->
      </el-table>

      <!-- 分页组件 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
        @pagination="getList" />
		</el-dialog>
		<group-detail-form ref="groupDetailFormRef"/>
		<authorize-drawer ref="authorizeDrawerRef" @success="getList"/>
	</div>
</template>
<script>
import { DICT_TYPE, getLineDatas, getDictDatas } from '@/utils/dict';
import groupDetailForm from '@/views/system/user/authorize/groupDetailForm.vue';
import AuthorizeDrawer from '@/views/system/user/authorize/authorizeDrawer.vue';
import * as AuthorizationApi from '@/api/nacs/authorize';
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
      authFailReasonDictDatas: getDictDatas(DICT_TYPE.NACS_AUTH_FAIL_REASONS),
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
    /** 下发权限 */
    async handleGrandAuth() {
      try {
        const isAudit = await deptAuthApi.isPermissionAudit(this.queryParams.deptId)
        if (isAudit) {
          this.$message.error('该部门存在未审核的预设权限，请等待管理员审核');
        } else {
          try {
            const res = await deptAuthApi.assignDeptPermission(this.queryParams.deptId)
            this.$modal.msgSuccess("权限已下发，请等待审核");
            this.getList();
            let userNames = res.data.map(item => item.employeeName).join(',');
            let message = `<div class="auth-error-container"
              style="max-height: 60vh; overflow: hidden; display: flex; flex-direction: column;>`;
            message += `<p style="font-weight: bold; margin-bottom: 20px;">用户 ${userNames} 的部门预设权限无法生效，原因如下：</p>`;
            message += `<div style="flex: 1;overflow-y:auto;">`;
            message += `<table style="width: 100%; border-collapse: collapse;margin-top: 20px;">`;
            message += `<thead style="position: sticky; top: 0; background: #f5f7fa; z-index: 1; ">`;
            message += `<tr><th style="padding: 10px;border-bottom: 1px solid #dfe6ec;">姓名</th>
              <th style="padding: 10px;border-bottom: 1px solid #dfe6ec;">线路</th>
              <th style="padding: 10px;border-bottom: 1px solid #dfe6ec;">失效原因</th></tr>`;
            
            res.data.forEach(item => {
              item.authFailReason.forEach(reason => {
                const reasonText = this.authFailReasonDictDatas.find(item => item.value === String(reason.failReason))?.label 
                                    || reason.failReason;
                message += `<tr>`;
                message += `<td style="padding: 10px;">${item.employeeName}</td>`;
                message += `<td style="padding: 10px;">${reason.lineName}</td>`;
                message += `<td style="padding: 10px;">${reasonText}</td>`;
                message += `</tr>`; 
              });
            });
            
            message += `</tbody></table></div></div>`
            this.$alert(message, '失效权限', {
              dangerouslyUseHTMLString: true,
              showConfirmButton: true,
              confirmButtonText: '确定'
            });
          } catch (error) {
            console.error("下发权限失败", error)
            this.$modal.msgError("下发权限失败")
          }
        }
      } catch(error) {
        console.error("检查是否有待审核的部门预设权限失败", error)
        this.$modal.msgError("检查是否有待审核的部门预设权限失败")
      }
      
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
<style lang="scss">
.el-message-box {
  width: 700px;
  .auth-error-container {
    overflow: hidden;
		margin-left: 12px;
		margin-right: 12px;
	}
  table {
    width: 100%;
    thead {
			overflow-y: auto;
			overflow-x: auto;
		}
    th, td {
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;
      // text-align: center;
    }

    th {
      position: sticky;
      // top: 0;
      background: #f5f7fa;
      z-index: 1;
    }
  }
}
</style>
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