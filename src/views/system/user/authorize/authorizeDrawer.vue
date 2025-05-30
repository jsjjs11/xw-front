<template>
	<div>
		<el-drawer
			title="用户授权"
			direction="rtl"
      size="90%"
			:modal="true"
      :append-to-body="true"
      :modal-append-to-body="false"
      :destroy-on-close="true"
			:visible.sync="drawerVisible"
			:before-close="handleClose">
				<el-form ref="form" :model="form" label-width="100px">
					<div class="auth-form-item">
						<div class="auth-container">
							<el-col :span="3">
								<!-- 线路列 -->
								<div class="column line-list">
									<div class="section-title">线路列表</div>
									<el-radio-group v-model="form.selectedLine" @change="onLineChange">
										<el-timeline class="custom-timeline">
											<el-timeline-item
												v-for="line in lineList"
												:key="line.lineNo"
												size="large">
												<template #dot>
													<el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`">
														{{ line.name }}
													</el-radio>
												</template>
											</el-timeline-item>
										</el-timeline>
									</el-radio-group>
								</div>
							</el-col>
							<!-- 车站列 -->
							<el-col :span="3">
								<div class="column station-list">
									<div class="section-title">车站列表</div>
									<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
									<el-checkbox-group v-model="form.selectedStation" @change="onStationChange">
										<el-checkbox v-for="station in stationList" :key="station.stationNo" :label="station.stationNo">
											{{ station.name }}
										</el-checkbox>
									</el-checkbox-group>
								</div>
							</el-col>
							
							<!-- 门禁列 -->
							<el-col :span="18">
								<div class="column auth-transfer">
									<div class="section-title">门禁列表</div>
									<div class="dual-table-container">
										<div class="table-wrapper left-table">
											<div class="table-header">
												<span>可选权限（{{ leftNonLeafCount }}）</span>
												<!-- <el-button type="text" @click="handleAddAuthSet">快捷选择</el-button> -->
											</div>
											<el-table
												:data = "authList"
												row-key = "key"
												:tree-props = "{ children: 'children', hasChildren: 'hasChildren' }"
												lazy
												:load = "loadAuthList"
												ref= "authTable"
												@select="handleLeftSelect"
												@select-all="handleLeftSelectAll">
												<el-table-column type="selection" width="60" :selectable="checkSelectable"></el-table-column>
												<el-table-column type="index" width="60"></el-table-column>
												<el-table-column label="权限名称" prop="label" width="calc(100% - 120px)" header-align="center">
													<template #default="{row}">
														<span :class="{ 'leaf-node': row.isLeaf }">{{ row.label }}</span>
													</template>
												</el-table-column>
											</el-table>
										</div>

										<div class="table-wrapper right-table">
											<div class="table-header">
												<span>已选权限（{{ selectedList.length }}）</span>
												<div class="header-buttons">
													<!-- <el-button type="text" @click="handleRemoveAuthSet">快捷移除</el-button> -->
													<el-button type="text" @click="handleEditTime">时区/周期批量修改</el-button>
												</div>
											</div>
											<el-table
												:data = "selectedList"
												row-key = "key"
												:tree-props = "{ children: 'children', hasChildren: 'hasChildren' }"
												lazy
												:load = "loadAuthList">
												<el-table-column type="index" width="50"></el-table-column>
												<el-table-column prop="label" label="权限名称" width="calc(100% - 510px)" header-align="center"></el-table-column>
												<el-table-column label="授权时区" prop="timePeriodId" width="120" header-align="center">
													<template #default="{row}">
															{{ getTimeZoneLabel(row.timePeriodId) }}
													</template>
												</el-table-column>
												<el-table-column label="授权周期" prop="dateRange" width="200" header-align="center"></el-table-column>
												<el-table-column label="操作" width="140" header-align="center">
													<template #default="{row}">
														<el-button type="text" v-if="!row.isLeaf" @click="moveToLeft(row)">移除</el-button>
														<el-button type="text" v-if="!row.isLeaf" @click="handleEdit(row)">编辑</el-button>
													</template>
												</el-table-column>
											</el-table>
										</div>
									</div>
								</div>
							</el-col>
						</div>
					</div>
				</el-form>
				<div class="dialog-footer">
					<el-button @click="drawerVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleAuthConfirm">确 定</el-button>
				</div>
		</el-drawer>
		<auth-time-edit-form ref="authTimeEditForm" @confirm="handleTimeConfirm"></auth-time-edit-form>
		<auth-time-to-line ref="authTimeToLine" @confirm="handleTimeToLineConfirm"></auth-time-to-line>
	</div>
</template>
<script>
import {getLineDatas} from "@/utils/dict";
import * as AuthorizationApi from '@/api/nacs/authorize';
import * as groupsApi from "@/api/nacs/d_groups/index";
import authTimeEditForm from "@/views/system/user/authorize/authTimeEditForm";
import authTimeToLine from "@/views/system/user/authorize/authTimeToLine"
export default {
	name: 'AuthorizeDrawer',
	components: {
		authTimeEditForm,
		authTimeToLine,
	},
	data() {
		return {
			visible: false,
			form: {
				selectedLine: '',
				selectedStation: [],
				// searchAuth: '',
				authItems: [],
			},
			loading: true,
			AuthorizeForm:{
        idCard: [],
        authItems: undefined,
      },
			drawerVisible: false,
			authProps: {
				label: 'label',
				children: 'children',
			},
			lineList: getLineDatas(),
			stationList: [],
			authList: [],
			selectedList: [],
			deviceList: [],
			groupList:[],
			existAuth: 0,
			checkAll: false,
			isIndeterminate: false,
		}
	},
	mounted() {
    
  },
	computed: {
		// 计算左侧非叶子节点数量
    leftNonLeafCount() {
      return this.countNonLeafNodes(this.authList)
    }
	},
	methods: {
		// 递归统计非叶子节点
    countNonLeafNodes(nodes) {
      let count = 0
      nodes.forEach(node => {
        if (!node.isLeaf) {
          count++
          if (node.children && node.children.length > 0) {
            count += this.countNonLeafNodes(node.children)
          }
        }
      })
      return count
    },
		/** 左侧表格勾选 */
		handleLeftSelect(selection, row) {
			if (row.isLeaf) return;
			// 判断是选中还是取消选中
			const isSelected = selection.some(item => item.key === row.key);
			if (isSelected) {
				// 获取当前日期和十年后日期
        const today = new Date();
        const tenYearsLater = new Date();
        tenYearsLater.setFullYear(today.getFullYear() + 10);
        
        // 格式化日期为YYYY-MM-DD
        const formatDate = (date) => {
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					return `${year}-${month}-${day}`;
        };
        
        const startTime = formatDate(today);
        const endTime = formatDate(tenYearsLater);
				// 添加到右侧表格
				this.selectedList.push({
					...row,
					children: row.children || [],
					timePeriodId: 0,
					startTime: startTime,
					endTime: endTime,
					dateRange: `${startTime}至${endTime}`,
					authSource: 0,
				});
			} else {
				// 从右侧表格移除
				const index = this.selectedList.findIndex(item => item.key === row.key);
				if (index > -1) {
					this.selectedList.splice(index, 1);
				}
			}
			
			// 更新左侧表格的选中状态
			this.$nextTick(() => {
				this.$refs.authTable.toggleRowSelection(row, isSelected);
			});
		},
		/** 左侧表格全选 */
		handleLeftSelectAll(selection) {
			// 获取当前页所有可选的非叶子节点
			const selectableRows = this.authList.filter(row => !row.isLeaf);
			
			// 判断是全选还是取消全选
			if (selection.length > 0) {
				// 全选操作 - 添加所有可选项到selectedList
				// 获取当前日期和十年后日期
        const today = new Date();
        const tenYearsLater = new Date();
        tenYearsLater.setFullYear(today.getFullYear() + 10);
        
        // 格式化日期为YYYY-MM-DD
        const formatDate = (date) => {
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					return `${year}-${month}-${day}`;
        };
				const startTime = formatDate(today);
        const endTime = formatDate(tenYearsLater);
				selectableRows.forEach(row => {
					if (!this.selectedList.some(item => item.key === row.key)) {
						this.selectedList.push({
							...row,
							children: row.children || [],
							timePeriodId: 0,
							startTime: startTime,
							endTime: endTime,
							dateRange: `${startTime}至${endTime}`,
							authSource: 0,
						});
					}
				});
			} else {
				// 取消全选 - 从selectedList中移除当前页所有项
				selectableRows.forEach(row => {
					const index = this.selectedList.findIndex(item => item.key === row.key);
					if (index > -1) {
						this.selectedList.splice(index, 1);
					}
				});
			}
		},
		/** 右侧表格移动到左侧 */
		moveToLeft(node) {
			if (node.isLeaf) return;
			const index = this.findIndex(this.selectedList, node.key);
			if (index > -1) {
				this.selectedList.splice(index, 1);
				// 更新左侧表格的选中状态
				const leftIndex = this.authList.findIndex(item => item.key === node.key);
				if (leftIndex > -1) {
						this.$nextTick(() => {
								this.$refs.authTable.toggleRowSelection(this.authList[leftIndex], false);
						});
				}
			}
		},
		/** 同步左侧表格勾选状态 */
    syncLeftSelection() {
			if (!this.$refs.authTable || !this.authList.length) return;
			// 设置选中状态
			this.selectedList.forEach(item => {
				const row = this.authList.find(auth => auth.key === item.key);
				if (row) {
					this.$refs.authTable.toggleRowSelection(row, true);
				}
			});
    },
		/** 处理时区/周期修改 */
		handleEdit(row) {
			this.$refs.authTimeEditForm.show(row);
		},
		/** 时区/周期修改确认 */
		handleTimeConfirm(data) {
			const index = this.selectedList.findIndex(item => item.key === data.key);
    	if (index !== -1) {
        this.$set(this.selectedList, index, {
					...this.selectedList[index],
					timePeriodId: data.timePeriodId,
					startTime: data.startTime,
					endTime: data.endTime,
					dateRange: `${data.startTime}至${data.endTime}`
        });
    	}
		},
		// 临时处理时区名称，需要增加接口返回时区名称
		getTimeZoneLabel(timePeriodId) {
			const timeZone = this.$refs.authTimeEditForm?.timeZones?.find(
				item => item.value === timePeriodId
			);
			return timeZone?.label || timePeriodId;
    },
		/** 时区/周期批量修改 */
		handleEditTime() {
			const lineNolist = this.selectedList.map(item => item.lineNo).filter((item, index, arr) => arr.indexOf(item) === index);
			console.log(lineNolist)
			this.$refs.authTimeToLine.show(lineNolist);
		},
		/** 时区/周期批量修改确认 */
		handleTimeToLineConfirm(data) {
			data ? data.forEach(item => {
				const index = this.selectedList.findIndex(
					selectedItem => selectedItem.lineNo === item.lineNo
				);
				if (index !== -1) {
					this.$set(this.selectedList, index, {
						...this.selectedList[index],
						timePeriodId: item.timePeriodId,
						startTime: item.startTime,
						endTime: item.endTime,
						dateRange: `${item.startTime}至${item.endTime}`
					});
				}
			}): null;
		},
		/** 快捷选择门禁集合 */
		handleAddAuthSet() {

		},
		/** 快捷移除门禁集合 */
		handleRemoveAuthSet() {

		},
		/** 加载子节点 */ 
		async loadAuthList(node, treeNode, resolve) {
			if (node.level === 0) {
				try {
					const response = await groupsApi.getGroupEquipList({
						pageNo: 1,
						pageSize: 10,
						code: node.code,
						lineNo: node.lineNo
					});
					const children = response.data.list.map(item => ({
						...item,
						key: `${item.lineNo}-1-${item.deviceCode}`,  // authMode设为1表示设备
						label: item.deviceName,
						isLeaf: true,  // 标记为叶子节点
						parentKey: node.key,  // 记录父节点key
						lineNo: item.lineNo,
						hasChildren: false,
					}));
					// 保持父节点数据完整
      		node.children = children;
      		resolve(children);
				} catch (error) {
					console.error('加载子设备失败:', error);
					resolve([]);
      	}
			} else {
				resolve([]);  // 叶子节点不需要继续加载
			}
		},
		/** 是否可勾选 */
		checkSelectable(row) {
			return !row.isLeaf ;
		},
		/** 查找节点索引 */
		findIndex(array, key) {
			for (let i = 0; i < array.length; i++) {
				if (array[i].key === key)  return i;
				if (array[i].children) {
					const index = this.findIndex(array[i].children, key);
					if (index > -1) return index;
				}
			}
			return -1;
		},
		/** 显示授权弹窗 */
    async showAuthDialog(data, total) {
      this.drawerVisible = true;
			this.AuthorizeForm.idCard = Array.isArray(data) ? data : [data];
			this.existAuth = total;
			if(this.lineList.length>1){
				this.form.selectedLine = this.lineList[0].lineNo  // 默认选中第一条线路
			}
			this.onLineChange(); // 默认载入第一条线路的站点
			this.selectedList = [];
			try {
				const res = await AuthorizationApi.getCardPermissionsList(this.AuthorizeForm.idCard)
				if(res.data && res.data.length > 0) {
					// 处理返回的权限数据
					res.data.forEach(item => {
						const key = `${item.lineNo}-${item.authMode}-${item.code}`;
						// const name = item.groupName ? item.groupName : item.deviceName;
						if (item.authMode === 1) {
							this.selectedList.push({
								...item,
								authMode: item.authMode,
								key: key,
								label: item.name,
								lineNo: item.lineNo, // 标记所属线路
								stationNo: item.stationNo, // 标记所属车站
								isleaf: false,
								// dateRange:`${item.startTime}至${item.endTime}`
							});
						} else if (item.authMode === 2) {
							this.selectedList.push({
								...item,
								authMode: item.authMode,
								key: key,
								label: item.name,
								lineNo: item.lineNo, // 标记所属线路
								stationNo: item.stationNo, // 标记所属车站
								isleaf: false,
								level: 0,
								hasChildren: true,
								children: [],
								// dateRange:`${item.startTime}至${item.endTime}`
							});
						}
					});
					// 同步左侧勾选状态
					this.$nextTick(() => {
						this.syncLeftSelection();
					});
				}
			} catch(error) {
				console.log(error)
				this.$message.error('获取用户授权信息失败');
			}
    },
		/** 关闭授权弹窗 */
    handleClose() {
      this.drawerVisible = false;
			this.form.selectedStation = [];
			this.checkAll = false;
			this.isIndeterminate = false;
      this.reset();
			// this.allAuthCache.clear(); // 关闭时清空全局缓存
		},
		/** 获取车站以及门禁数据 */
		async onLineChange() {
      if(this.form.selectedLine){
				const res = await AuthorizationApi.getGroupsOrDevicesList(this.form.selectedLine);
				const {groups, stations, devices} = res.data;
				// console.log(res.data)
				// 车站数据
				this.stationList = stations ? stations.map(item => ({
					stationNo: item.stationNo,
					name: item.name,
				})) : [];
				// // 默认全选所有车站
    		// this.form.selectedStation = this.stationList.map(station => station.stationNo);
				// this.checkAll = true;
				// this.isIndeterminate = false;
				// 门禁组数据
				this.groupList = groups ? groups.map(item => ({
					...item,
					label: item.name || `门禁组-${item.code}`,
					key: `${this.form.selectedLine}-${item.authMode}-${item.code}`,
					code: item.code,
					name: item.name,
					authMode: 2,
					lineNo: this.form.selectedLine,
					stationNo: '',
					level: 0,
					isleaf: false,
					hasChildren: true,
					children: []
				})) : [];
				this.deviceList = devices ? devices.map(item => ({
					...item,
					label: item.name || `门禁设备-${item.code}`,
					key: `${this.form.selectedLine}-${item.authMode}-${item.code}`,
					code: item.code,
					name: item.name,
					authMode: 1,
					lineNo: this.form.selectedLine,
					stationNo: item.stationNo,
					isleaf: false,
				})) : [];
				// console.log("门禁设备", this.deviceList)
				// console.log("车站", this.stationList)
				// console.log("门禁组", this.groupList)
				// 同步左侧勾选状态
				// 重置车站选择状态
				this.form.selectedStation = [];
				this.checkAll = false;
				this.isIndeterminate = false;
				this.syncLeftSelection();
				
				this.onStationChange();
      }
    },
		/** 全选 */
		handleCheckAllChange(val) {
			this.form.selectedStation = val ? this.stationList.map(station => station.stationNo) : [];
			this.isIndeterminate = false;
			this.onStationChange();
		},
		/** 根据车站更新门禁数据 */
		onStationChange() {
			// 更新全选状态
			if (this.form.selectedStation.length === this.stationList.length) {
				this.checkAll = true;
				this.isIndeterminate = false;
			} else if (this.form.selectedStation.length > 0) {
				this.isIndeterminate = true;
			} else {
				this.checkAll = false;
				this.isIndeterminate = false;
			}
			// 根据选中的车站筛选门禁数据
			let filteredList = [];
			if (this.form.selectedStation.length === 0) {
				filteredList = [...this.groupList];
			} else {
				filteredList = [
					...this.groupList, 
					...this.deviceList.filter(device => 
							this.form.selectedStation.includes(device.stationNo)
					)
				];
			}
			// const selectedKeys = this.selectedList.map(item => item.key);
			this.authList = [...filteredList];
			this.$nextTick(() => {
				this.syncLeftSelection();
			});
			// console.log('门禁列表:', this.authList)
		},
		/** 提交授权 */
		async handleAuthConfirm() {
			// 格式化日期范围
			// const dateRangeStr = this.form.dateRange
			// 	.map(date => {
			// 		const d = new Date(date);
			// 		return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
			// 	})
			// 	.join(',');
			
			// 按authMode分类门禁项
			const authItems = [];

			this.selectedList.forEach(item => {
				authItems.push({
					authMode: item.authMode,
					lineNo: item.lineNo,
					stationNo: item.stationNo,
					code: item.code,
					name: item.name,
					timePeriodId: item.timePeriodId,
					startTime: item.startTime,
					endTime: item.endTime,
					authSource: item.authSource,
				})
			});
			const params = {
				idCards: this.AuthorizeForm.idCard,
				authItems,
			};
			console.log('提交授权参数:', params);
			// if (this.existAuth === 0) {
				try {
					await AuthorizationApi.createCardPermissionsList(params);
					this.$message.success('授权成功');
					this.reset();
					this.drawerVisible = false;
				} catch (error) {
					console.log('授权失败:', error);
					this.$message.error('授权失败');
				}
		},
		reset() {
			this.form = {
				timePeriodId: 0,
				dateRange: '',
				selectedLine: '',
				selectedStation: [],
				// searchAuth: '',
				authItems: [],
			};
		}
	}
}
</script>
<style lang="scss" scoped>
// .quick-date-buttons {
// 	margin-top: 20px;
//   display: flex;
//   gap: 8px;
//   flex-wrap: wrap;
// }
// .auth-column {
// 	margin-top:20px;
// }
:deep(.el-form) {
  height: auto !important;
  min-height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
}
.auth-form-item {
	position: relative;
	padding: 0px;
	height: 100%;
  
  /* 移除默认间隔 */
  // margin-bottom: 0;

  /* 内容区域样式 */
  .auth-container {
    position: relative;
    margin-left: 40px;
    // min-height: 40px;
		height:100%;
    line-height: 40px;
		margin-top: 0;
		padding-left: 0;
  }
}

/* 三列布局 */
.auth-columns {
  display: flex;
  gap: 20px;
  margin-top: 15px;

}

/* 列公共样式 */
.column {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

/* 滚动条设置 */
.line-list,
.station-list {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.auth-transfer {
  height: calc(100vh - 180px);
  overflow: auto; /* 同时具备横向和纵向滚动 */
}

/* 时间线样式优化 */
:deep(.custom-timeline) {
  padding-left: 10px;
  .el-timeline-item__node {
    background: transparent;
  }
}

/* 单选按钮样式 */
.el-radio {
  display: block;
  margin: 8px 0;
}
:deep(.station-list) .el-checkbox {
  margin-bottom: 0px;
  display: block;
}
::v-deep .el-timeline-item__tail {
  left: 6px;
  margin-top: 18px;
}
::v-deep .el-timeline-item__timestamp.is-top {
  margin-bottom: 3px;
}
::v-deep(.custom-timeline-station)  .el-timeline-item {
  padding-bottom: 10px;
}
::v-deep .el-timeline-item {
  padding-bottom: 18px;
}
.dialog-footer {
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  text-align: right;
  border-top: 1px solid #e8e8e8;
}
.dual-table-container {
  display: flex;
  gap: 15px;
  height: calc(100vh - 260px);
  margin-top: 10px;
	width: 1180px;
	margin-left: 15px;

  .table-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background: #fff;
		position: relative;
		overflow: hidden;

    &.left-table {
      margin-right: 8px;
			flex: 0 0 40%;
    }
    &.right-table {
      margin-left: 8px;
			flex: 0 0 60%;
    }

		.table-header {
			padding: 12px 16px;
			background: #f5f7fa;
			border-bottom: 1px solid #ebeef5;
			font-weight: 600;
			color: #303133;
			display: flex;
			align-items: center;
			justify-content: space-between;
			
			span {
				font-size: 14px;
				letter-spacing: 0.5px;
			}
			.header-buttons {
        display: flex;
        gap: 8px;
   	 	}
		}
		.el-table {
			flex: 1;
			border: none;
			display: flex;
			flex-direction: column;
			::v-deep .el-table__body-wrapper {
				overflow-x: hidden;
			}

			::v-deep .el-table__header-wrapper {
				th {
					background: #f5f7fa;
				}
			}
		}
	}

  
}

// 保持原有其他样式
.leaf-node {
  color: #999;
  cursor: not-allowed;
}

.el-icon-view {
  margin-left: 8px;
  color: #c0c4cc;
}
::v-deep .el-table {
  th > .cell {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center !important;
    font-weight: 600;
    color: #303133;
  }
	td > .cell {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center !important;
    font-weight: 400;
    color: #606266;
  }
  /* 调整表头单元格padding */
  .el-table__header-wrapper th {
    padding: 14px 16px;

  }

  /* 适配树形表格展开图标 */
  .el-table__expand-icon {
    margin-right: 8px;
  }
	/* 固定表头样式 */
	.el-table__header-wrapper {
		position: sticky;
		top: 0;
		z-index: 2;
		background: white;
	}

	/* 内容区域滚动 */
	.el-table__body-wrapper {
		overflow-y: auto !important;
		height: calc(100% - 40px); /* 减去表头高度 */
	}

	/* 调整滚动条样式 */
	&::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	&::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 4px;
	}
}
/* 在原有样式基础上添加 */
::v-deep .right-table {
  /* 统一表头单元格padding */
  .el-table__header th {
    padding: 14px 16px !important;
  }

  /* 统一数据行单元格padding */
  .el-table__body td {
    padding: 3px 0px !important;
  }

  /* 统一行高 */
  .el-table__row {
    height: 44px;
  }

  /* 统一字体大小 */
  .cell {
    font-size: 14px;
  }
}
</style>