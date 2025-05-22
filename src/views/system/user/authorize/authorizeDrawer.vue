<template>
	<div>
		<el-drawer
			title="用户授权"
			direction="rtl"
      size="70%"
			:modal="true"
      :append-to-body="true"
      :modal-append-to-body="false"
      :destroy-on-close="true"
			:visible.sync="drawerVisible"
			:before-close="handleClose">
				<el-form ref="form" :model="form" label-width="100px">
					<el-form-item label="授权时区" prop="timeZone">
						<el-select v-model="form.timeZone"></el-select>
					</el-form-item>
					<el-form-item label="授权周期" prop="period">
						<el-date-picker
							v-model="form.dateRange"
							type="daterange"
							range-separator="至"
							start-placeholder="开始日期"
							end-placeholder="结束日期">
						</el-date-picker>
						<!-- 快捷按钮行 -->
						<div class="quick-date-buttons">
							<el-button 
								v-for="btn in quickButtons"
								:key="btn.type"
								@click="handleQuickDate(btn.type)"
								size="small"
								plain>
								{{ btn.label }}
							</el-button>
						</div>
					</el-form-item>
					<el-form-item label="授权区域" prop="authItems" class="auth-items">
						<div class="auth-container">
						<!-- 搜索框 -->
						<!-- <el-input
							v-model="form.searchAuth"
							placeholder="输入门禁名称搜索"
							clearable
							class="auth-search"
							suffix-icon="el-icon-search"
							@input="filterAuthItems"
						/> -->
						<div class="auth-column">
							<el-col :span="4">
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
							<el-col :span="4">
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
							<el-col :span="16">
								<div class="column auth-transfer">
									<div class="section-title">门禁列表</div>
									<el-transfer
										:key="transferKey"
										style="text-align: left; display: inline-block;"
										v-model="values"
										filterable
										:left-default-checked="[]"
										:right-default-checked="[]"
										:titles="['可选权限', '已选权限']"
										:format="{
										noChecked: '${total}',
										hasChecked: '${checked}/${total}'
									}"
										@change="handleChange"
										:data="authList"
										class="custom-transfer">
									</el-transfer>
								</div>
							</el-col>
						</div></div>
					</el-form-item>
				</el-form>
				<div class="dialog-footer">
					<el-button @click="drawerVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleAuthConfirm">确 定</el-button>
				</div>
		</el-drawer>
	</div>
</template>
<script>
import {getLineDatas} from "@/utils/dict";
import * as AuthorizationApi from '@/api/nacs/authorize';
export default {
	name: 'AuthorizeDrawer',
	data() {
		return {
			visible: false,
			form: {
				timeZone: '',
				dateRange: [],
				selectedLine: '',
				selectedStation: [],
				searchAuth: '',
				authItems: [],
			},
			loading: true,
			AuthorizeForm:{
        idCard: [],
        authItems: undefined,
      },
			drawerVisible: false,
			quickButtons: [
        { type: 'day', label: '一天' },
        { type: 'week', label: '一周' },
        { type: 'month', label: '一月' },
        { type: 'year', label: '一年' },
        { type: 'decade', label: '十年' }
      ],
			authProps: {
				label: 'label',
				children: 'children',
			},
			lineList: getLineDatas(),
			stationList: [],
			authList: [],
			values: [],
			selectedStationsCache: new Set(),
			selectedAuthsCache: new Set(),
			deviceCache: new Map(), // 各车站设备数据缓存
			allAuthCache: new Map(), // 全局门禁数据缓存
			transferKey: 0,
			existAuth: 0,
			checkAll: false,
			isIndeterminate: false,
		}
	},
	mounted() {
    
  },
	methods: {
		/** 显示授权弹窗 */
    async showAuthDialog(data, total) {
      this.drawerVisible = true;
      this.AuthorizeForm.idCard.push(data);
			this.existAuth = total;
			if(this.lineList.length>1){
				this.form.selectedLine = this.lineList[0].lineNo
			}
			this.onLineChange(); // 默认载入第一条线路的站点
			try {
				const res = await AuthorizationApi.getCardPermissionsList(this.AuthorizeForm.idCard)
				// console.log('读取到的已选权限',res.data)
				if(res.data && res.data.length > 0) {
					this.values = res.data.map(item => {
						if (item.authMode === 0) {
							// 处理群组权限
							return `${item.lineNo}-${item.groupCode}`;
						} else {
							return `${item.lineNo}-${item.deviceCode}`;
						}
					});
					// console.log('已选权限:', this.values);
					// 更新已选权限缓存
					this.selectedAuthsCache = new Set(this.values);
				}
			} catch(error) {
				console.log(error)
				this.$message.error('获取用户授权信息失败');
			}
    },
		/** 关闭授权弹窗 */
    handleClose() {
      this.drawerVisible = false;
      this.reset();
			// this.allAuthCache.clear(); // 关闭时清空全局缓存
		},
		handleQuickDate(type) {
      const start = new Date()
      const end = new Date()

      switch(type) {
        case 'day':
          // 开始和结束都为当天
          break
        case 'week':
          end.setDate(end.getDate() + 6)
          break
        case 'month':
          end.setMonth(end.getMonth() + 1)
          end.setDate(end.getDate() - 1)
          break
        case 'year':
          end.setFullYear(end.getFullYear() + 1)
          end.setDate(end.getDate() - 1)
          break
        case 'decade':
          end.setFullYear(end.getFullYear() + 10)
          break
      }
      this.form.dateRange = [start, end]
    },
		/** 获取车站以及门禁数据 */
		async onLineChange() {
      if(this.form.selectedLine){
				this.deviceCache.clear(); // 清空设备缓存
				// 清空当前线路的旧缓存（保留其他线路的缓存）
				this.allAuthCache.forEach((value, key) => {
					if (value.lineNo === this.form.selectedLine) {
						this.allAuthCache.delete(key);
					}
				});
				// this.values = Array.from(this.selectedAuthsCache)
				// console.log('已选权限:', this.values);
        // const res = await LineApi.line2Station({lineNo:this.form.selectedLine});
        // this.stationList = res.data;
				const res = await AuthorizationApi.getGroupsOrDevicesList(this.form.selectedLine);
				const {groups, stations} = res.data;
				// console.log(res.data)
				// 车站数据
				this.stationList = stations ? stations.map(item => ({
					stationNo: item.stationNo,
					name: item.stationName,
				})) : [];
				// 默认全选所有车站
    		this.form.selectedStation = this.stationList.map(station => station.stationNo);
				this.selectedStationsCache = new Set(this.form.selectedStation);
				this.checkAll = true;
				this.isIndeterminate = false;
				if (stations && stations.length > 0) {
					stations.forEach(station =>{
						if (station.devices) {
							const devices = station.devices.map(device => ({
								authMode: 1,
								key: device.deviceCode,
								label: device.deviceName,
								stationNo: station.stationNo,
								...device
							}));
							this.deviceCache.set(station.stationNo, devices);
						}
					})
				}
				// 缓存群组数据
				groups? groups.forEach(group => {
					const key = `${res.data.lineNo}-${group.groupCode}`;
					this.allAuthCache.set(key, {
						...group,
						authMode: 0,
						key: key,
						label: group.groupName,
						lineNo: this.form.selectedLine // 标记所属线路
					});
				}) : [];

				// 缓存设备数据
				stations ? stations.forEach(station => {
					if (station.devices) {
						station.devices.forEach(device => {
							const key = `${res.data.lineNo}-${device.deviceCode}`;
							const label = `${station.stationName}-${device.deviceName}`;
							this.allAuthCache.set(key, {
								...device,
								authMode: 1,
								key: key,
								label: label,
								lineNo: this.form.selectedLine, // 标记所属线路
								stationNo: station.stationNo     // 标记所属车站
							});
						});
					}
				}) : [];
				this.updateAuthList();
				this.transferKey += 1;
				// this.form.selectedStation = this.stationList
				// 	.filter(station => this.selectedStationsCache.has(station.stationNo))
				// 	.map(station => station.stationNo) || [];
				// console.log('恢复选中的车站:', this.form.selectedStation);
      }
    },
		/** 全选 */
		handleCheckAllChange(val) {
			this.form.selectedStation = val ? this.stationList.map(station => station.stationNo) : [];
			this.selectedStationsCache = new Set(this.form.selectedStation);
			this.isIndeterminate = false;
			this.onStationChange();
		},
		/** 根据车站更新门禁数据 */
		onStationChange() {
			// if(this.form.selectedStation && this.form.selectedStation.length > 0){
				// 更新已选车站缓存
				this.selectedStationsCache = new Set(this.form.selectedStation);
				this.values = Array.from(this.selectedAuthsCache)
				// console.log('已选权限:', this.values);
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
				// this.updateAuthList();
				// 筛选设备数据
				const filteredDevices = Array.from(this.allAuthCache.values())
					.filter(item => {
						if (item.authMode === 0) return true; // 保留所有群组
						if (item.authMode === 1) {
							return this.selectedStationsCache.has(item.stationNo); // 根据车站筛选设备
						}
						return false;
					});
				
				// 合并已选权限
				const selectedAuths = Array.from(this.selectedAuthsCache)
					.map(key => this.allAuthCache.get(key))
					.filter(item => item !== undefined);
				
				// 更新门禁列表
				this.authList = [...filteredDevices, ...selectedAuths]
					.filter((item, index, self) => 
						self.findIndex(i => i.key === item.key) === index
					);
				this.transferKey += 1;
				// 获取门禁列表
				// const res = await AuthorizationApi.getStationDeviceList(this.form.selectedStation);
				// const currentAuthList = res.data.map(item => ({
				// 	authMode: 1,
				// 	key: item.deviceCode,
				// 	label: item.deviceName,
				// 	...item
				// }));
				// this.transferKey += 1;
				// console.log('门禁列表:', this.authList);
			// } else {
			// 	this.authList = [];
			// }
		},

		updateAuthList() {
			// 获取所有选中车站的设备
			// const selectedDevices = Array.from(this.selectedStationsCache)
			// 	.flatMap(stationNo => this.deviceCache.get(stationNo) || []);
			// // 合并群组和设备
			// this.authList = [
			// 	...this.authList.filter(item => item.authMode === 0), // 保留群组
			// 	...selectedDevices
  		// ];
			// 当前线路的群组
			const currentGroups = Array.from(this.allAuthCache.values())
				.filter(item => item.authMode === 0 && item.lineNo === this.form.selectedLine);

			// 当前选中车站的设备
			// const currentDevices = Array.from(this.selectedStationsCache)
			// 	.flatMap(stationNo => 
			// 		Array.from(this.allAuthCache.values()).filter(item => 
			// 			item.authMode === 1 && 
			// 			item.stationNo === stationNo &&
			// 			item.lineNo === this.form.selectedLine
			// 		)
			// 	);
			// 获取当前线路的所有设备（无论车站是否选中）
    	const currentDevices = Array.from(this.allAuthCache.values())
        .filter(item => item.authMode === 1 && item.lineNo === this.form.selectedLine);
			// 所有已选权限的数据（包括其他线路的）
			const selectedAuths = Array.from(this.selectedAuthsCache)
				.map(key => this.allAuthCache.get(key))
				.filter(item => item !== undefined);

			// 合并数据：当前群组 + 当前设备 + 已选权限（去重）
			this.authList = [...currentGroups, ...currentDevices, ...selectedAuths]
				.filter((item, index, self) => 
					self.findIndex(i => i.key === item.key) === index
				);
			// console.log(this.authList)
		},
		/** 穿梭框变化 */
		handleChange(value, direction, movedKeys) {
			console.log('传输变化:', value, direction, movedKeys);
      if (!movedKeys || movedKeys.length === 0) return;
			// 更新已选权限缓存
    	this.selectedAuthsCache = new Set(value);
			if (direction === 'right') {
				this.values = value;
				this.$message.success(`已添加 ${movedKeys.length} 个授权项`);
			} else if (direction === 'left') {
				this.values = value;
				this.$message.warning(`已移除 ${movedKeys.length} 个授权项`);
			}
			// console.log('已选权限:', this.values);
		},

		/** 提交授权 */
		async handleAuthConfirm() {
			// 格式化日期范围
			const dateRangeStr = this.form.dateRange
				.map(date => {
					const d = new Date(date);
					return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
				})
				.join(',');
			
			// 按authMode分类门禁项
			const authItems = [];
			const groupMap = new Map();
			const deviceMap = new Map();

			// 先分类处理
			this.values.forEach(key => {
				const item = this.authList.find(a => a.key === key);
				if (!item) return;
				
				if (item.authMode === 0) {
					// 群组处理
					if (!groupMap.has(item.lineNo)) {
						groupMap.set(item.lineNo, []);
					}
					groupMap.get(item.lineNo).push({
						groupCode: item.groupCode,
						groupName: item.groupName
					});
				} else {
					// 设备处理
					const deviceKey = `${item.lineNo}-${item.stationNo}`;
					if (!deviceMap.has(deviceKey)) {
						deviceMap.set(deviceKey, {
							lineNo: item.lineNo,
							stationNo: item.stationNo,
							devices: []
						});
					}
					deviceMap.get(deviceKey).devices.push({
						deviceCode: item.deviceCode,
						deviceName: item.deviceName
					});
				}
			});

			// 构建群组项
			groupMap.forEach((groups, lineNo) => {
				authItems.push({
					authMode: 0,
					groups: groups.map(group => ({
						lineNo: lineNo,
						groupCode: group.groupCode,
						groupName: group.groupName
					}))
				});
			});

			// 构建设备项
			deviceMap.forEach(deviceInfo => {
				authItems.push({
					authMode: 1,
					devices: deviceInfo.devices.map(device => ({
						lineNo: deviceInfo.lineNo,
						stationNo: deviceInfo.stationNo,
						deviceCode: device.deviceCode,
						deviceName: device.deviceName
					}))
				});
			});

			const params = {
				idCard: this.AuthorizeForm.idCard,
				authItems,
				timeZone: this.form.timeZone,
				dateRange: dateRangeStr,
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
			// } else {
			// 	try {
			// 		await AuthorizationApi.updateCardPermissionsList(params);
			// 		this.$message.success('授权成功');
			// 		this.reset();
			// 		this.drawerVisible = false;
			// 	} catch (error) {
			// 		console.log('授权失败:', error);
			// 		this.$message.error('授权失败');
			// 	}
			// }
		},
		reset() {
			this.form = {
				timeZone: '',
				dateRange: [],
				selectedLine: '',
				selectedStation: [],
				searchAuth: '',
				authItems: [],
			};
			this.selectedStationsCache.clear();
			this.selectedAuthsCache.clear();
			this.deviceCache.clear();
			this.allAuthCache.clear(); // 关闭时清空全局缓存
		}
	}
}
</script>
<style lang="scss" scoped>
.quick-date-buttons {
	margin-top: 20px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
// .auth-column {
// 	margin-top:20px;
// }
:deep(.auth-items) {
  /* 改为块级布局 */
  display: block !important;
  
  /* 移除默认间隔 */
  // margin-bottom: 0;
  
  /* 标签容器样式 */
  .el-form-item__label {
    display: block;
    // width: 100% !important;
    text-align: left !important;
    padding-bottom: 16px;  /* 增加标签与内容间距 */
    line-height: 1.5;
		margin-left: 30px !important;
  }

  /* 内容区域样式 */
  .el-form-item__content {
    display: block;
    // width: 100%;
    margin-left: 30px !important;
    
    /* 内容子元素容器 */
    .auth-container {
      margin-top: 40px;
    }
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
  height: 550px;
  overflow-y: auto;
}

.auth-transfer {
  height: 550px;
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
::v-deep .el-transfer {
	margin-left: 30px;
	// display: flex !important;
	flex-wrap: nowrap !important;
}
::v-deep .el-transfer-panel {
	margin-top: 10px;
	width: 300px;
	height: 480px;
	overflow: auto;
	.el-transfer-panel__body {
		height: 420px;
	}
	.el-transfer-panel__list.is-filterable {
		height:360px;
	}
}
</style>