<template>
	<div>
		<el-dialog
			title="用户授权"
			width="60%"
			:visible.sync="dialogVisible"
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
					<el-button @click="dialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="handleAuthConfirm">确 定</el-button>
				</div>
		</el-dialog>
	</div>
</template>
<script>
import * as LineApi from '@/api/nacs/line';
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
        idCard: undefined,
        authItems: undefined,
      },
			dialogVisible: false,
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
			existAuth: 0,
			checkAll: false,
			isIndeterminate: false,
		}
	},
	mounted() {
    if(this.lineList.length>1){
      this.form.selectedLine = this.lineList[0].lineNo
    }
    this.onLineChange(); // 默认载入第一条线路的站点
  },
	methods: {
		/** 显示授权弹窗 */
    showAuthDialog(data, total) {
      this.dialogVisible = true;
      this.AuthorizeForm.idCard = data;
			this.existAuth = total;
    },
		/** 关闭授权弹窗 */
    handleClose() {
      this.dialogVisible = false;
      this.reset();
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
		/** 获取车站数据 */
		async onLineChange() {
      if(this.form.selectedLine){
        const res = await LineApi.line2Station({lineNo:this.form.selectedLine});
        this.stationList = res.data;
				this.checkAll = false;
				this.isIndeterminate = false;
        // this.form.selectedStation = this.stationList.length ? this.stationList[0].stationNo : null;
				// 恢复之前选中的车站
				this.form.selectedStation = this.stationList
					.filter(station => this.selectedStationsCache.has(station.stationNo))
					.map(station => station.stationNo) || [];
					// console.log('恢复选中的车站:', this.form.selectedStation);
        // 不自动触发onStationChange，保留原有门禁数据
				if(this.form.selectedStation.length > 0) {
					if(this.form.selectedStation.length === this.stationList.length) {
						this.checkAll = true;
						this.isIndeterminate = false;
					}
					await this.onStationChange();
				}
      }
    },
		/** 全选 */
		handleCheckAllChange(val) {
			this.form.selectedStation = val ? this.stationList.map(station => station.stationNo) : [];
			this.selectedStationsCache = new Set(this.form.selectedStation);
			this.isIndeterminate = false;
		},
		/** 获取门禁数据 */
		async onStationChange() {
			if(this.form.selectedStation && this.form.selectedStation.length > 0){
				// 更新已选车站缓存
      	this.selectedStationsCache = new Set(this.form.selectedStation);
				if(this.form.selectedStation.length < this.stationList.length) {
					this.isIndeterminate = true;
				}
				// 获取门禁列表
				const res = await AuthorizationApi.getStationDeviceList(this.form.selectedStation);
				this.authList = res.data.map(item => ({
					authMode: 1,
					key: item.deviceCode,
					label: item.deviceName,
					...item
				}));
				console.log('门禁列表:', this.authList);
				// 模拟数据 - 根据选中的车站返回不同的门禁点
				// console.log('选中的车站:', this.form.selectedStation);
      // this.authList = this.form.selectedStation.flatMap(stationNo => {
      //   if(stationNo === 'S00001') {
      //     return [
      //       {
      //         key: 'bgz-001',
      //         label: '八卦洲A区门禁组',
      //         authMode: 0,
      //         groupCode: 'bgz-001',
      //         groupName: '八卦洲A区门禁组'
      //       },
      //       {
      //         key: 'bgz-002',
      //         label: '八卦洲B区门禁组', 
      //         authMode: 0,
      //         groupCode: 'bgz-002',
      //         groupName: '八卦洲B区门禁组'
      //       },
      //       {
      //         key: 'bgz-dev-001',
      //         label: '八卦洲1号门禁点',
      //         authMode: 1,
      //         deviceCode: 'bgz-dev-001',
      //         deviceName: '八卦洲1号门禁点'
      //       }
      //     ];
      //   } else if(stationNo === 'S00002') {
      //     return [
      //       {
      //         key: 'bds-001',
      //         label: '笆斗山办公区门禁组',
      //         authMode: 0,
      //         groupCode: 'bds-001',
      //         groupName: '笆斗山办公区门禁组'
      //       },
      //       {
      //         key: 'bds-dev-001',
      //         label: '笆斗山1号门禁点',
      //         authMode: 1,
      //         deviceCode: 'bds-dev-001',
      //         deviceName: '笆斗山1号门禁点'
      //       },
      //       {
      //         key: 'bds-dev-002',
      //         label: '笆斗山2号门禁点',
      //         authMode: 1,
      //         deviceCode: 'bds-dev-002',
      //         deviceName: '笆斗山2号门禁点'
      //       }
      //     ];
      //   }
      //   return [];
      // });
			} else {
				this.authList = [];
			}
			console.log('门禁列表:', this.authList);
		},

		/** 穿梭框变化 */
		handleChange(value, direction, movedKeys) {
			console.log('传输变化:', value, direction, movedKeys);
      if (!movedKeys || movedKeys.length === 0) return;
			if (direction === 'right') {
				this.values = value;
				this.$message.success(`已添加 ${movedKeys.length} 个授权项`);
			} else if (direction === 'left') {
				this.values = value;
				this.$message.warning(`已移除 ${movedKeys.length} 个授权项`);
			}
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
			const authItems = this.values.reduce((result, key) => {
				const item = this.authList.find(a => a.key === key);
				if (!item) return result;
				
				if (item.authMode === 0) {
					const group = result.find(r => r.authMode === 0);
					if (group) {
						group.groupCode.push(item.groupCode);
					} else {
						result.push({
							authMode: 0,
							groupCode: [item.groupCode]
						});
					}
				} else {
					const device = result.find(r => r.authMode === 1);
					if (device) {
						device.deviceCode.push(item.deviceCode);
					} else {
						result.push({
							authMode: 1,
							deviceCode: [item.deviceCode]
						});
					}
				}
				return result;
			}, []);

			const params = {
				idCard: this.AuthorizeForm.idCard,
				authItems,
				timeZone: this.form.timeZone,
				dateRange: dateRangeStr,
			};
			console.log('提交授权参数:', params);
			if (this.existAuth === 0) {
				try {
					await AuthorizationApi.createCardPermissionsList(params);
					this.$message.success('授权成功');
					this.reset();
					this.dialogVisible = false;
				} catch (error) {
					console.log('授权失败:', error);
					this.$message.error('授权失败');
				}
			} else {
				try {
					await AuthorizationApi.updateCardPermissionsList(params);
					this.$message.success('授权成功');
					this.reset();
					this.dialogVisible = false;
				} catch (error) {
					console.log('授权失败:', error);
					this.$message.error('授权失败');
				}
			}
			// const res = await createCardPermissionsList(params);
			// this.$message.success('授权成功');
			// this.reset();
			// this.dialogVisible = false;
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
  height: 450px;
  overflow-y: auto;
}

.auth-transfer {
  height: 450px;
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
	margin-left: 7px;
}
::v-deep .el-transfer-panel {
	width: 250px;
	height: 390px;
	overflow: auto;
	
}
</style>