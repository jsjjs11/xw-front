<template>
	<div>
		<el-drawer
			title="快捷选择权限"
			:visible.sync="visible"
			:with-header="false"
			size="30%"
			:append-to-body="true"
			:before-close="handleClose"
			>
			<div class="content-container">
				<!-- 左侧门禁集合列表 -->
				<div class="auth-set-list">
					<div class="list-header">
          	<h3>门禁集合列表</h3>
						<span class="total-count">共 {{ total }} 个</span>
					</div>

					<el-table
						v-loading="loading"
					  class="auth-set-table"
						:data="permissionSets"
						style="width: calc(100% - 60px)"
						@expand-change = "loadPermissionSetDetailList"
						@select="handleSelect"
						@select-all="handleSelectAll"
						ref="authSetTable"
						>
						<el-table-column type="selection" width="60"></el-table-column>
						<el-table-column type="index" width="60"></el-table-column>
						<el-table-column prop="setName" label="门禁集合名称"></el-table-column>
						<el-table-column prop="remark" label="备注"></el-table-column>
						<el-table-column type="expand" width="60">
        			<template slot-scope="scope">
								<el-table
									:data="scope.row.children"
									border
									style="width: 100%"
									:row-key="row => row.id">
									<el-table-column prop="name" label="权限名称"></el-table-column>
									<el-table-column prop="lineName" label="线路名称"></el-table-column>
									<el-table-column prop="authMode" label="权限模式">
										<template v-slot="scope">
											<dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
										</template>
									</el-table-column>
								</el-table>
        			</template>
    				</el-table-column>
					</el-table>
				</div>
			</div>
			<div class="drawer-footer">
				<el-button type="primary" @click="handleSave">确定</el-button>
				<el-button @click="visible = false">取消</el-button>
			</div>
		</el-drawer>
	</div>
</template>
<script>
import * as permissionSetApi from "@/api/nacs/permission_set"
import { DICT_TYPE, getLineDatas, getDictDatas } from '@/utils/dict'
export default {
	name: "ChoosePermissionSetForm",
	data() {
		return {
			visible: false,
			permissionSets: [],
			selectedPermissionSets: [],
			queryParams: {
				pageNo: 1,
				pageSize: 10000
			},
			total: 0,
			selectedAuth: [],
			lineMap: getLineDatas(),
			loading: false,
		};
	},
	methods: {
		async show(selectedAuth = []) {
			this.loading = true;
			this.permissionSets = [];
			this.selectedAuth = [...selectedAuth]; // 初始化已选数据
			// console.log(this.selectedAuth)
			try {
				const response = await permissionSetApi.getPermissionSetPage(this.queryParams);
				if (response.data.list && response.data.list.length > 0) {
					this.total = response.data.total;
					response.data.list.forEach(item => {
						this.permissionSets.push({
							...item,
							children: [],
						});
					});
					this.$nextTick(() => {
						this.permissionSets.forEach(row => {
							if (this.selectedAuth.some(auth => auth.setCode === row.setCode)){
								this.$refs.authSetTable.toggleRowSelection(row, true);
							}
						})
					})
				}
				this.visible = true;
			} catch (error) {
				console.log(error);
				this.$message.error("获取门禁集合列表失败");
			} finally {
				this.loading = false;
			}
		},
		handleClose() {
			this.visible = false;
		},
		/** 加载门禁集合详情 */
		async loadPermissionSetDetailList(row, expandedRows) {
			if (expandedRows.includes(row) && (!row.children || !row.children.length)) {
				try {
					const response = await permissionSetApi.getPermissionSetDetailList(row.setCode);
					if (response.data) {
						this.$set(row, 'children', response.data.map(item => ({
							...item,
							lineName: this.lineMap.find(line => line.lineNo === item.lineNo).name
						})));
					}
				} catch (error) {
					console.log(error);
					this.$message.error("获取门禁集合详情失败");
				}
			}
		},
		async handleSelect(selected, row) {
			// 当前行的选中状态
			const isSelected = selected.some(item => item.setCode === row.setCode);
			try {
				const response = await permissionSetApi.getPermissionSetDetailList(row.setCode);
				if (response.data) {
					if (isSelected) {
						// 选中时添加数据
						this.selectedAuth = [...this.selectedAuth, ...response.data];
					} else {
						// 取消选中时移除数据
						this.selectedAuth = this.selectedAuth.filter(
								item => !response.data.some(d => d.id === item.id)
						);
					}
				}
			} catch (error) {
				console.log(error);
				this.$message.error("获取门禁集合详情失败");
			}
			this.selectedPermissionSets = [...selected];
		},
		async handleSelectAll(selected) {
			this.selectedPermissionSets = [...selected];
			this.selectedAuth = []; // 先清空
			if (selected.length === 0) {
				return; // 全不选时直接返回
			}
			const promises = this.selectedPermissionSets.map(item => {
				return permissionSetApi.getPermissionSetDetailList(item.setCode)
					.then(response => response.data || [])
					.catch(error => {
						console.log(error);
						this.$message.error("获取门禁集合详情失败");
						return [];
					});
			});

			const results = await Promise.all(promises);
			this.selectedAuth = results.flat();
		},
		handleSave() {
			// 只返回当前选中的集合对应的完整子项
			const result = this.selectedPermissionSets.flatMap(set => 
				this.selectedAuth.filter(auth => auth.setCode === set.setCode)
			);
			this.$emit("confirm", result);
			this.visible = false;
		}
	}
}
</script>
<style lang="css" scoped>
.drawer-footer {
	position: absolute;
	bottom: 20px;
	right: 30px;
}
::v-deep .auth-set-table {
	margin-left: 30px;
	margin-right: 30px;
	margin-top: 20px;
	
}
::v-deep .el-table__body-wrapper {
	overflow-y: auto;
	max-height: 740px;
}

.list-header {
	padding: 15px 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid #ebeef5;
	/* background-color: #fafafa; */
	
	h3 {
		margin: 0;
		font-size: 16px;
		color: #303133;
	}
	.total-count {
		font-size: 13px;
		color: #909399;
	}
}

</style>