<template>
	<div>
		<el-drawer
			:title="title"
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
													<el-radio 
														:label="line.lineNo" 
														:class="`color-radio-${line.lineNo}`" 
														:disabled="!isLineEnable(line.lineNo)">
														{{ line.name }}
														<el-tooltip 
															v-if="showUnauthWarning(line.lineNo)"
															effect="dark" 
															placement="right">
															<!-- :content="getUnauthWarningText(line.lineNo)" -->
															<div slot="content" v-html="getUnauthWarningText(line.lineNo)" style="white-space: pre-line;"></div>
															<i class="el-icon-warning" style="color: #F56C6C; margin-left: 5px;"></i>
													</el-tooltip>
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
									<div class="section-title-container">
										<div class="section-title">门禁列表</div>
										<template v-if="AuthorizeForm.deptId.length === 0 && AuthorizeForm.idCard.length === 1">
											<el-checkbox v-model="hasDeptAuth">添加部门预设权限</el-checkbox>
										</template>
									</div>
									<div class="dual-table-container">
										<div class="table-wrapper left-table">
											<div class="table-header">
												<span>可选权限（{{ leftNonLeafCount }}）</span>
												<el-button type="text" @click="handleAddAuthSet">快捷选择</el-button>
											</div>
											<el-table
												:data = "authList"
												row-key = "key"
												:tree-props = "{ children: 'children', hasChildren: 'hasChildren' }"
												lazy
												:load = "loadAuthList"
												ref= "authTable"
												@select="handleLeftSelect"
												@select-all="handleLeftSelectAll"
												class="left-table">
												<el-table-column type="selection" width="60" :selectable="checkSelectable"></el-table-column>
												<!-- <el-table-column type="index" width="60"></el-table-column> -->
												<el-table-column label="权限名称" prop="label" width="calc(100% - 180px)" header-align="center">
													<template #default="{row}">
														<span :class="{ 'leaf-node': row.isLeaf }" style="text-align: left;">{{ row.label }}</span>
													</template>
												</el-table-column>
												<el-table-column label="权限模式" prop="authMode" width="120" align="center">
													<template v-slot="scope">
														<dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
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
												:load = "loadAuthList"
												class="right-table">
												<!-- <el-table-column type="index" width="50"></el-table-column> -->
												<el-table-column prop="label" label="权限名称" width="calc(100% - 460px)" header-align="center">
													<template #default="{row}">
														<span style="text-align: left; ">{{ row.label }}</span>
													</template>
												</el-table-column>
												<el-table-column label="授权时区" prop="timeCode" width="120" align="center">
													<template #default="{row}">
															{{ row.timeName }}
													</template>
												</el-table-column>
												<el-table-column label="授权周期" prop="dateRange" width="200" align="center"></el-table-column>
												<el-table-column label="操作" width="140" align="center">
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
		<choose-permission-set-form ref="choosePermissionSetForm" @confirm="handleChoosePermissionSetConfirm"></choose-permission-set-form>
	</div>
</template>
<script>
import {getLineDatas, DICT_TYPE, getDictDatas} from "@/utils/dict";
import * as AuthorizationApi from '@/api/nacs/authorize';
import * as groupsApi from "@/api/nacs/d_groups/index";
import authTimeEditForm from "@/views/system/user/authorize/authTimeEditForm";
import authTimeToLine from "@/views/system/user/authorize/authTimeToLine"
import ChoosePermissionSetForm from "@/views/system/user/authorize/ChoosePermissionSetForm";
import * as deptAuthApi from '@/api/nacs/department_auth';
import * as TimePeriodApi from '@/api/nacs/time_period';
export default {
	name: 'AuthorizeDrawer',
	components: {
		authTimeEditForm,
		authTimeToLine,
		ChoosePermissionSetForm,
	},
	data() {
		return {
			title: '用户授权',
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
				deptId: [],
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
			lineInfo: [],
			authFailReasonDictDatas: getDictDatas(DICT_TYPE.NACS_AUTH_FAIL_REASONS),
			hasDeptAuth: true,
			unAuthLines: [],
			timePeriodCache: null,
		}
	},
	watch: {
		hasDeptAuth(newVal) {
			if (newVal) {
				this.addDeptPresetPermissions();
				this.$nextTick(() => {
					this.syncLeftSelection();
				});
			} else {
				// 移除部门预设权限
				this.removeDeptPresetPermissions();
			}
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
		// 检查是否显示授权警告
    showUnauthWarning(lineNo) {
			if (!this.unAuthLines || this.unAuthLines.length === 0) return false;
			return this.unAuthLines.some(user => {
				// 检查unAuthLines中的线路
				const hasUnauthLine = user.unAuthLines && user.unAuthLines.some(line => line.lineNo === lineNo);
				// 检查normalLines中的线路 - 如果当前线路不在normalLines中，则需要显示警告
				const hasNormalLine = user.normalLines && user.normalLines.length > 0 && !user.normalLines.includes(lineNo);
				return hasUnauthLine || hasNormalLine;
			});
    },
    
    // 获取授权警告文本
    getUnauthWarningText(lineNo) {
			if (!this.unAuthLines || this.unAuthLines.length === 0) return '';
			const warnings = [];
			this.unAuthLines.forEach(user => {
				const unAuthLine = user.unAuthLines && user.unAuthLines.find(line => line.lineNo === lineNo);
				if (unAuthLine) {
					const reasonText = this.authFailReasonDictDatas.find(
						item => item.value === String(unAuthLine.failReason)
					)?.label || unAuthLine.failReason;
					warnings.push(`用户${user.employeeName}不能在该线路授予权限，原因：${reasonText}`);
				}
				if (user.normalLines && user.normalLines.length > 0 && !user.normalLines.includes(lineNo)){
					warnings.push(`用户${user.employeeName}不能在该线路授予权限，原因：用户没有线网卡，且没有该条线路的线路卡`);
				}
			});
			return warnings.join('<br>');
    },
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
        
        const startDate = formatDate(today);
        const endDate = formatDate(tenYearsLater);
				// 添加到右侧表格
				this.selectedList.push({
					...row,
					children: row.children || [],
					timeCode: row.timeCode || 0,
					startDate: startDate,
					endDate: endDate,
					dateRange: `${startDate}至${endDate}`,
					timeName: row.timeName,
					// authSource: 0,
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
			console.log(this.selectedList)
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
				const startDate = formatDate(today);
        const endDate = formatDate(tenYearsLater);
				selectableRows.forEach(row => {
					if (!this.selectedList.some(item => item.key === row.key)) {
						this.selectedList.push({
							...row,
							children: row.children || [],
							timeCode: row.timeCode || 0,
							startDate: startDate,
							endDate: endDate,
							dateRange: `${startDate}至${endDate}`,
							timeName: row.timeName,
							// authSource: 0,
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
			// 首先清空所有选中项
			this.authList.forEach(row => {
				this.$refs.authTable.toggleRowSelection(row, false);
			});
			// const currentSelections = this.$refs.authTable.selection || [];
			// 设置选中状态
			this.selectedList.forEach(item => {
				const row = this.authList.find(auth => auth.key === item.key);
				if (row) {
					this.$refs.authTable.toggleRowSelection(row, true);
				}
			});
			// console.log('左右表格勾选同步完成',currentSelections, this.selectedList)
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
					timeCode: data.timeCode,
					startDate: data.startDate,
					endDate: data.endDate,
					dateRange: `${data.startDate}至${data.endDate}`
        });
    	}
		},
		// 临时处理时区名称，需要增加接口返回时区名称
		getTimeZoneLabel(timeCode, lineNo) {
			if (!this.timePeriodCache) {
        return timeCode; // 如果缓存不存在，直接返回timeCode
      }
			const timePeriod = this.timePeriodCache.find(
        item => item.lineNo === lineNo && item.timeCode === timeCode
      );
      return timePeriod?.timeName || '全时区';
			// const timeZonelist = [{ value:0, label:'全时区' }]
			// const timeZone = timeZonelist.find(
			// 	item => item.value === timeCode
			// );
			// return timeZone?.label || timeCode;
    },
		/** 时区/周期批量修改 */
		handleEditTime() {
			const lineNolist = this.selectedList.map(item => item.lineNo).filter((item, index, arr) => arr.indexOf(item) === index);
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
						timeCode: item.timeCode,
						startDate: item.startDate,
						endDate: item.endDate,
						dateRange: `${item.startDate}至${item.endDate}`
					});
				}
			}): null;
		},
		/** 快捷选择门禁集合 */
		handleAddAuthSet() {
			// 转换已选数据为集合格式
			const setCodes = [...new Set(this.selectedList.map(item => item.setCode))];
			this.$refs.choosePermissionSetForm.show(this.selectedList.filter(item => setCodes.includes(item.setCode)));
		},
		/** 快捷选择门禁集合确认 */
		handleChoosePermissionSetConfirm(data) {
			if (data) {
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
				const startDate = formatDate(today);
        const endDate = formatDate(tenYearsLater);

				// 获取当前已存在的setCode集合
				const existingSetCodes = [...new Set(this.selectedList.map(item => item.setCode))];
				const existingKeys = new Set(this.selectedList.map(item => item.key));
				// 1. 获取新选中集合的所有setCode
				const newSetCodes = new Set(data.map(item => item.setCode));
				
				// 移除selectedList中属于被取消集合的权限项,只移除那些有setCode且不在新选中集合中的项
				this.selectedList = this.selectedList.filter(item => {
					// 如果没有setCode，说明是手动添加的权限，保留
					if (!item.setCode) return true;
					
					// 如果有setCode且在新选中集合中，保留
					if (newSetCodes.has(item.setCode)) return true;
					
					// 移除有setCode但不在新选中集合中的项
					return false;
				});
				console.log(this.selectedList)
				// 添加新选中的集合的所有子项
				// const newSetCodes = data.map(item => item.setCode);
				const toAdd = data.filter(item => !this.selectedList.some(s => s.code === item.code));

				toAdd.forEach(async item => {
					const key = `${item.lineNo}-${item.authMode}-${item.code}`;
					
					// 检查是否已存在相同key的项
					// const isExist = this.selectedList.some(selectedItem => selectedItem.key === key);
					const isExist = existingKeys.has(key);
					const isLineEnable = this.isLineEnable(item.lineNo);
					const timeName = this.getTimeZoneLabel(item.timeCode, item.lineNo);
					const res = await TimePeriodApi.getTimePeriod(item.lineNo);
					const timeCode = res.data[0]?.timeCode;
					console.log(timeCode)
					if (!isExist && isLineEnable) {
						if(item.authMode === 1){
							this.selectedList.push({ 
								...item,
								key: key,
								label: item.name,
								timeCode:  timeCode || 0,
								startDate: startDate,
								endDate: endDate,
								dateRange: `${startDate}至${endDate}`,
								// authSource: 0,
								isleaf: false,
								timeName: timeName,
							})
						} else if (item.authMode === 2) {
							this.selectedList.push({
								...item,
								key: key,
								label: item.name,
								children: item.children || [],
								timeCode: timeCode || 0,
								startDate: startDate,
								endDate: endDate,
								dateRange: `${startDate}至${endDate}`,
								// authSource: 0,
								isleaf: false,
								level: 0,
								hasChildren: true,
								timeName: timeName,
							})
						}
					}
				});
				// 同步左侧勾选状态
				this.$nextTick(() => {
					this.syncLeftSelection();
				});
			}
			console.log(this.selectedList)
		},
		// /** 快捷移除门禁集合 */
		// handleRemoveAuthSet() {

		// },
		/** 加载子节点 */ 
		async loadAuthList(node, treeNode, resolve) {
			if (node.level === 0) {
				try {
					const response = await groupsApi.getGroupEquip({
						code: node.code,
						lineNo: node.lineNo
					});
					const children = response.data.map(item => ({
						...item,
						key: item.id, //`${item.lineNo}-device-${item.deviceCode}`,  // authMode设为1表示设备
						label: item.deviceName || item.deviceCode,
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
		/** 检查线路是否可启用 */
		isLineEnable(lineNo) {
			if(!this.lineInfo || this.lineInfo.length === 0) return true;
			return this.lineInfo.includes(lineNo);
		},
		/** 显示授权弹窗 */
    async showAuthDialog(data, deptId, lineInfo) {
      this.drawerVisible = true;
			this.title = '用户授权';
			this.AuthorizeForm.idCard = Array.isArray(data) ? data : [data];
			this.AuthorizeForm.deptId = deptId;
			if (!this.timePeriodCache) {
        const res = await TimePeriodApi.getTimePeriodAll();
        this.timePeriodCache = res.data;
      }
			if (this.AuthorizeForm.idCard.length === 1){
				if (lineInfo[0].cardSource === 0) {
					const unAuthNos = lineInfo[0].unAuthLines.map(item => item.lineNo);
					const allLineNos = this.lineList.map(line => line.lineNo);
					this.lineInfo = allLineNos.filter(lineNo => !unAuthNos.includes(lineNo));
				} else if (lineInfo[0].cardSource === 1) {
					this.lineInfo = lineInfo[0].normalLines;
				}
			} else if (this.AuthorizeForm.idCard.length > 1) {
				this.lineInfo = []
			}
			this.unAuthLines = lineInfo;
			if(this.lineList.length>1){
				const enabledLine = this.lineList.find(line => this.isLineEnable(line.lineNo));
				this.form.selectedLine = enabledLine ? enabledLine.lineNo : this.lineList[0].lineNo;  // 默认选中第一条可用的线路
			}
			this.onLineChange(); // 默认载入第一条线路的站点
			this.selectedList = [];
			if (this.AuthorizeForm.idCard.length === 1) {
				try {
					const res = await AuthorizationApi.getCardPermissionsList(this.AuthorizeForm.idCard);
					await this.handlePermissionData(res.data, false);
				} catch(error) {
					console.log(error);
					this.$message.error('获取用户授权信息失败');
				}
				this.addDeptPresetPermissions();
				
			} else if (this.AuthorizeForm.idCard.length === 0 && this.AuthorizeForm.deptId) {
				this.title = '部门预设权限管理';
				try {
					const res = await deptAuthApi.getdeptPermission(this.AuthorizeForm.deptId);
					await this.handlePermissionData(res.data, false);
				} catch(error) {
					console.log(error);
					this.$message.error('获取部门授权信息失败');
				}
			}
    },

		handlePermissionData(data, isDeptAuth) {
			if (data && data.length > 0) {
				data.forEach(item => {
					const key = `${item.lineNo}-${item.authMode}-${item.code}`;
					const timeName = this.getTimeZoneLabel(item.timeCode, item.lineNo);
					const permissionItem = {
						...item,
						authMode: item.authMode,
						key: key,
						label: isDeptAuth ? `${item.name}(部门预设权限)` : item.name,
						lineNo: item.lineNo,
						stationNo: item.stationNo,
						isleaf: false,
						dateRange: item.startDate && item.endDate ? `${this.formatDateFromArray(item.startDate)}至${this.formatDateFromArray(item.endDate)}`: '',
						startDate: item.startDate ? this.formatDateFromArray(item.startDate): '',
						endDate: item.endDate ? this.formatDateFromArray(item.endDate): '',
						timeCode: item.timeCode ? Number(item.timeCode): 0,
						timeName: timeName || '全时区',
					};
					
					if (item.authMode === 2) {
						permissionItem.level = 0;
						permissionItem.hasChildren = true;
						permissionItem.children = [];
					}
					this.selectedList.push(permissionItem);
				});
				console.log('已有权限数据:', this.selectedList);
				this.$nextTick(() => {
					this.syncLeftSelection();
				});
			}
		},
		// 添加部门预设权限
		async addDeptPresetPermissions() {
			if(this.hasDeptAuth) {
				try {
					const response = await deptAuthApi.getDeptPresetPermissions(this.AuthorizeForm.idCard);
					this.handlePermissionData(response.data, true);
				} catch(error) {
					console.log(error);
					this.$message.error('获取部门预设权限失败');
				}
			}
		},
		// 移除部门预设权限
		removeDeptPresetPermissions() {
			this.selectedList = this.selectedList.filter(item => 
				!item.label || !item.label.includes('(部门预设权限)')
			);
			this.$nextTick(() => {
				this.syncLeftSelection();
			});
		},
		formatDateFromArray(dateArray) {
			// 确保月份和日期是两位数
			const year = dateArray[0];
			const month = String(dateArray[1]).padStart(2, '0');
			const day = String(dateArray[2]).padStart(2, '0');
			
			return `${year}-${month}-${day}`;
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
				const timeCode = res.data.timeCode;
				const timeName = this.getTimeZoneLabel(timeCode, this.form.selectedLine);
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
					children: [],
					timeCode: timeCode,
					timeName: timeName || '全时区',
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
					timeCode: timeCode,
					timeName: timeName || '全时区',
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
			const authItems = [];

			this.selectedList.forEach(item => {
				authItems.push({
					authMode: item.authMode,
					lineNo: item.lineNo,
					stationNo: item.stationNo,
					code: item.code,
					name: item.name,
					timeCode: item.timeCode,
					startDate: item.startDate,
					endDate: item.endDate,
					authSource: this.AuthorizeForm.deptId && this.AuthorizeForm.idCard.length === 0 ? 1 : 0,
				})
			});
			let params;
			if (this.AuthorizeForm.deptId && this.AuthorizeForm.idCard.length === 0) {
				params = {
					deptId: this.AuthorizeForm.deptId,
					authItems,
				}
			} else if (this.AuthorizeForm.idCard.length >= 1) {
				// 用户授权逻辑
				const defaultPermissions = [];
				const users = [];
				// 获取所有线路号
				const allLineNos = this.lineList.map(line => line.lineNo);
				// 处理每个用户的不可授权线路
				this.unAuthLines.forEach(user => {
					let unAuthLineNos = [];
					if (user.cardSource === 0) {
						// cardSource为0时，unAuthLines中的线路号为不可授权线路
						unAuthLineNos = user.unAuthLines.map(item => item.lineNo);
					} else if (user.cardSource === 1) {
						// cardSource为1时，先减去unAuthLines中的线路号，再与全线路取差值
						const normalLines = user.normalLines || [];
						const unAuthLines = user.unAuthLines?.map(item => item.lineNo) || [];
						const availableLines = normalLines.filter(lineNo => !unAuthLines.includes(lineNo));
						unAuthLineNos = allLineNos.filter(lineNo => !availableLines.includes(lineNo));
					}
					users.push({
						idCard: user.idCard,
						permissions: unAuthLineNos.length > 0 ? 
							this.selectedList.filter(perm => unAuthLineNos.includes(perm.lineNo)) : []
					});
				});
				// 默认权限是所有选中的权限
				defaultPermissions.push(...this.selectedList.map(item => ({
					authMode: item.authMode,
					lineNo: item.lineNo,
					stationNo: item.stationNo,
					code: item.code,
					name: item.name,
					timeCode: item.timeCode,
					startDate: item.startDate,
					endDate: item.endDate,
					authSource: 0,
				})));
				params = {
					defaultPermissions,
					users
				};
			}
			// const params = {
			// 	idCards: this.AuthorizeForm.idCard,
			// 	authItems,
			// };
			console.log('提交授权参数:', params);
			
			if (this.AuthorizeForm.deptId && this.AuthorizeForm.idCard.length === 0) {
				try {
					await deptAuthApi.createdeptPermission(params);
					this.$message.success('权限已更改');
					this.$emit('success');
					this.reset();
					this.drawerVisible = false;
				} catch (error) {
					console.log('授权失败:', error);
					this.$message.error('授权失败');
				}
			} else if (this.AuthorizeForm.idCard.length >= 1) {
				// 检查是否有用户存在无效权限
        const hasInvalidPermissions = params.users.some(user => user.permissions.length > 0);
				if (hasInvalidPermissions) {
					let message = `<div class="auth-error-container" 
						style="max-height: 60vh; overflow: hidden; display: flex; flex-direction: column;">`;
					message += `<p style="font-weight: bold; margin-bottom: 10px;">存在无法授予的权限，是否继续进行授权？</p>`;
					message += `<div style="flex: 1;">`;
        	message += `<table style="width: 100%; border-collapse: collapse; min-width: 600px;">`;
        	message += `<thead style="position: sticky; top: 0; background: #f5f7fa; z-index: 1;">`;
					message += `<tr><th style="padding: 12px 16px;border-bottom: 1px solid #dfe6ec;">姓名</th>
						<th style="padding: 12px 16px;border-bottom: 1px solid #dfe6ec;">线路</th>
						<th style="padding: 12px 16px;border-bottom: 1px solid #dfe6ec;">无效的权限</th></tr>`;
					
					params.users.forEach(item => {
						item.permissions.forEach(perm => {
							const employeeName = this.unAuthLines.find(user => user.idCard === item.idCard)?.employeeName || item.idCard;
							const lineName = this.lineList.find(line => line.lineNo === perm.lineNo)?.name || perm.lineNo;
							message += `<tr>`;
							message += `<td style="padding: 12px 16px;">${employeeName}</td>`;
							message += `<td style="padding: 12px 16px;">${lineName}</td>`;
							message += `<td style="padding: 12px 16px;">${perm.name}</td>`;
							message += `</tr>`; 
						});
					});
					
					message += `</tbody></table></div></div>`;
					this.$confirm(message, '无效的权限', {
						dangerouslyUseHTMLString: true,
						showConfirmButton: true,
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						// type:	'warning'
					}).then(async () => {
						try {
							const res = await AuthorizationApi.createCardPermissionsList(params);
							this.$message.success('权限已更改，请等待审核');
							this.reset();
							this.drawerVisible = false;
						} catch (error) {
							console.log('授权失败:', error);
							this.$message.error('授权失败');
						}
					}).catch(() => {
						this.$message({
							type: 'info',
							message: '已取消授权'
						});  
					});
				} else {
					try {
						const res = await AuthorizationApi.createCardPermissionsList(params);
						this.$message.success('权限已更改，请等待审核');
						this.reset();
						this.drawerVisible = false;
					} catch (error) {
						console.log('授权失败:', error);
						this.$message.error('授权失败');
					}
				}
				
			}
		},
		reset() {
			this.form = {
				timeCode: '',
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
/* 禁用状态样式 */
:deep(.el-radio.is-disabled) {
  cursor: not-allowed;
  opacity: 0.6;
}

:deep(.el-radio.is-disabled .el-radio__label) {
  color: #999;
  cursor: not-allowed;
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
	.el-table__body {
		tr > td:first-child {  // 第一列是权限名称列
			.cell {
				display: flex !important;
				justify-content: flex-start !important;
				text-align: left !important;
				padding-left: 10px;
				> span {
					display: inline-block;
					text-align: left;
				}
			}
		}
	}
}
::v-deep .left-table {
	.el-table__body {
		tr > td:nth-child(2) {  // 第二列是权限名称列
			.cell {
				display: flex !important;
				justify-content: flex-start !important;
				text-align: left !important;
				padding-left: 10px;
				> span {
					display: inline-block;
					text-align: left;
				}
			}
		}
	}
}
.section-title-container {
	display: flex;
	// justify-content: space-between;
	align-items: center;
	padding: 0 16px;
	margin-bottom: 10px;
	
	.section-title {
		margin: 0;
	}
	.el-checkbox {
		margin-left: 454px;
		// margin-right: 600px; // 与右侧表格对齐
	}
}
:deep(.el-tooltip__popper) {
  white-space: pre-line;
  max-width: 400px;
  line-height: 1.5;
}
</style>