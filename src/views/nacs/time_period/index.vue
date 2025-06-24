<template>
	<div class="app-container">
		<el-row :gutter="20" class="full-height">
			<el-col :span="3" :xs="24" class="timeline-container">
				<div class="section-title">线路列表</div>
				<el-radio-group v-model="selectedLine" @change="onLineChange" style="width: 100%;">
					<el-timeline class="custom-timeline">
						<el-timeline-item v-for="line in lineList" :key="line.lineNo" size="large">
							<template #dot>
								<el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`">
									{{line.name}}</el-radio>
							</template>
						</el-timeline-item>
					</el-timeline>
				</el-radio-group>
			</el-col>
			<el-col :span="21" :xs="24" class="content-container">
				<div v-if="timeZoneList && timeZoneList.length === 0" class="empty-data">
					<i class="el-icon-warning-outline empty-icon"></i>
					<div class="empty-text">未同步数据</div>
				</div>
        <el-button  v-if="timeZoneList && timeZoneList.length !== 0"  type="primary" @click="handleChangeTimeZone" icon="el-icon-plus" style="width: 150px;">同步修改</el-button>

        <div v-if="timeZoneList && timeZoneList.length !== 0" v-for="(zone, zoneIndex) in timeZoneList" :key="zoneIndex" class="time-period-container">
					<el-row type="flex" justify="space-between" align="middle" class="time-period-header">
						<span class="time-period-title">{{ zone.timeName }}</span>
						<div>
							<!-- <el-button type="text" size="mini" @click="handleZoneDelete">删除</el-button>
							<el-switch v-model="status" active-color="rgb(12 140 255)"
								inactive-color="#ff4949"></el-switch> -->
						</div>
					</el-row>
					<el-table :data="zone.timePeriodData" border style="width: 100%">
						<el-table-column type="selection" width="50" align="center" />
						<el-table-column type="index" label="序号" width="60" align="center" />
						<el-table-column v-for="(day, index) in week" :key="index" :label="day" width="100"
							align="center">
							<template slot-scope="scope">
								<el-switch v-model="scope.row.timeRanges[index].status" active-color="rgb(12 140 255)"
									inactive-color="#ff4949"></el-switch>
							</template>
						</el-table-column>
						<el-table-column label="开始时间" prop="startTime" width="180" align="center" />
						<el-table-column label="结束时间" prop="endTime" width="180" align="center" />
						<el-table-column label="操作" prop="operation" width="calc(100% - 1420px)" align="center">
							<template slot-scope="scope">
								<el-button type="text" size="mini"
									@click="handleEdit(scope.row, zoneIndex)">修改</el-button>
								<!-- <el-button type="text" size="mini"
									@click="handleDelete(scope.row, zoneIndex)">删除</el-button> -->
							</template>
						</el-table-column>
					</el-table>
					<el-button @click="handleAdd(zoneIndex)" icon="el-icon-plus"
						style="width:100%; margin-top:10px">增加新时段</el-button>
				</div>
			</el-col>
		</el-row>
		<time-zone ref="timeZoneRef" @confirm="handleTimeZoneConfirm" />
		<time-range-form ref="timerangeFormRef" @confirm="handleTimeRangeConfirm" />
	</div>
</template>
<script>
import TimeRangeForm from '@/views/nacs/time_period/TimeRangeForm.vue';
import TimeZone from '@/views/nacs/time_period/TimeZone.vue';
import { getLineDatas } from "@/utils/dict";
import * as TimePeriodApi from '@/api/nacs/time_period';
export default {
	name: "TimePeriod",
	components: {
		TimeRangeForm,
		TimeZone
	},
	data() {
		const week = ["周六", "周一", "周二", "周三", "周四", "周五", "周日"];
		return {
			selectedLine: '',
			lineList: getLineDatas(),
			week: week,
			status: true,
      rawData:null,
			timeZoneList: [
			],
			editingRow: null,
			editingZoneIndex: null,
		}
	},
	mounted() {
		if (this.lineList.length > 1) {
			this.selectedLine = this.lineList[0].lineNo
		}
		this.onLineChange(); // 默认载入第一条线路的站点
	},
	methods: {
		// 根据线路选择站点
		async onLineChange() {
			if (this.selectedLine) {
				this.timeZoneList = [];
				let resData = await TimePeriodApi.getTimePeriod(this.selectedLine);
				let res = resData.data
				// 解析res数组中的每条记录
                this.rawData = res;
				res.forEach(record => {

					// 构建时间段数据
					const timePeriodData = [];

					// 遍历5个可能的时间段
					for(let i = 1; i <= 5; i++) {
						const startTime = record[`startTime${i}`];
						const endTime = record[`endTime${i}`];
						const weekFlag = record[`weekFlag${i}`];

						// 如果存在开始时间,说明这个时间段有效
						if(startTime) {
							// 解析周标识为布尔数组
							let weekArray = null;
							if(weekFlag && weekFlag.length >= 8 && weekFlag[0] === '1') {
								weekArray = new Array(7).fill(true);
							} else {
								weekArray = weekFlag ? weekFlag.split('').map(bit => bit === '1') : [];
								// 补齐7位
								while (weekArray.length < 7) {
									weekArray.unshift(false);
								}
							}

							timePeriodData.push({
                periodDataId:i,
								timeRanges: [
									{ status: weekArray[0] }, // 周六
									{ status: weekArray[1] }, // 周一
									{ status: weekArray[2] }, // 周二
									{ status: weekArray[3] }, // 周三
									{ status: weekArray[4] }, // 周四
									{ status: weekArray[5] }, // 周五
									{ status: weekArray[6] }  // 周日
								],
								week: ["周六", "周一", "周二", "周三", "周四", "周五", "周日"],
								startTime: startTime,
								endTime: endTime
							});
						}
					}
					// 构建完整的时区数据
					this.timeZoneList.push({
						timeName: record.timeName,
            id:record.id,
						timePeriodData: timePeriodData
					});
				});
			}
		},
		handleChangeTimeZone() {
			//遍历timeZoneList 将timeRanges编码成二进制字符串，如果全部为1则将第八位置1 其余位置为0

			let commitData = []
			this.timeZoneList.forEach(zone => {
				//根据id 找到rawData中的对应数据
				let rawData = this.rawData.find(item => item.id === zone.id);
				zone.timePeriodData.forEach((timeRange,index) => {
					rawData[`weekFlag${index+1}`] = this.getBinaryString(timeRange.timeRanges);
					rawData[`startTime${index+1}`] = timeRange.startTime;
					rawData[`endTime${index+1}`] = timeRange.endTime;
				})

				commitData.push(rawData)
			});
			TimePeriodApi.createTimePeriod({ TimePeriod:commitData });
		},
		getBinaryString(timeRanges){
			let count = 0;
			let binary = timeRanges.map(range => {
				if(range.status){
					count++;
				}
				return range.status ? '1' : '0'
			}).join('');
			if(count === 7){
				binary = '1' + '0000000';
			}else{
				binary = '0' + binary;
			}
			return binary;
		},
		handleTimeZoneConfirm(data) {
			const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			const timePeriodData = data.timeRanges.map(range => {
				return {
					timeRanges: week.map(day => ({
						status: range.weekdays.includes(day)
					})),
					week: [...week],
					startTime: range.startTime || "00:00",
					endTime: range.endTime || "23:59"
				};
			});
			// this.timeZoneList.forEach(item=>{
			// 	if (item.periodDataId==data.periodDataId){
			// 		return {
			// 			timeName: data.name,
			// 			timePeriodData: timePeriodData
			// 		}
			// 	}
			// })
			this.timeZoneList.push({
				timeName: data.name,
				timePeriodData: timePeriodData
			});
			console.log(this.timeZoneList.timePeriodData)
		},
		handleZoneDelete() {
			if (this.editingZoneIndex === null) return;
			this.$confirm('确定要删除该时区吗?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.timeZoneList.splice(this.editingZoneIndex, 1);
				this.editingZoneIndex = null;
				this.$message({
					type: 'success',
					message: '删除成功!'
				});
			}).catch(() => {
				this.$message({
					type: 'info',
					message: '已取消删除'
				});
			});
		},
		handleAdd(zoneIndex) {
			const week = this.week;
			//timeZoneList长度超过5则不能新增
			if (this.timeZoneList[zoneIndex].timePeriodData.length >= 5) {
				this.$message({
					type: 'warning',
					message: '最多只能创建5个时区'
				});
				return;
			}
      let index = this.timeZoneList[zoneIndex].timePeriodData.length
			this.timeZoneList[zoneIndex].timePeriodData.push({
				periodDataId:index+1,
				timeRanges: this.createNewTimeRanges(),
				week: [...week],
				startTime: "00:00",
				endTime: "23:59",
			})
		},
		createNewTimeRanges() {
			return this.week.map(() => ({ status: true }));
		},
		handleEdit(row, zoneIndex) {
			this.editingRow = {...row};
			this.editingZoneIndex = zoneIndex;
			this.$refs["timerangeFormRef"].show(row);
			console.log(row)
		},
		handleTimeRangeConfirm(data) {
			console.log(data);
			const zoneIndex = this.editingZoneIndex;
			const index = this.timeZoneList[zoneIndex].timePeriodData.findIndex(row =>
				row.periodDataId == data.periodDataId
			);
			if (index !== -1) {
				this.$set(this.timeZoneList[zoneIndex].timePeriodData, index, {
					...this.timeZoneList[zoneIndex].timePeriodData[index],
					timeRanges: data.timeRanges,
					startTime: data.startTime,
					endTime: data.endTime,
				});
				this.editingRow = null;
			}
		},
		handleDelete(row, zoneIndex) {
			this.editingZoneIndex = zoneIndex;
			this.$confirm('确定要删除该时段吗?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				const index = this.timeZoneList[zoneIndex].timePeriodData.indexOf(row);
				if (index !== -1) {
					this.timeZoneList[zoneIndex].timePeriodData.splice(index, 1);
					this.$message({
						type: 'success',
						message: '删除成功!'
					});
				}
			}).catch(() => {
				this.$message({
					type: 'info',
					message: '已取消删除'
				});
			});
		},
	}
}
</script>
<style lang="scss" scoped>
.full-height {
	height: 100%;
}
.section-title{
	font-size: 16px;
	font-weight: bold;
}
.timeline-container {
	border: 1px solid #e2e2e2;
	height: 100%;
	display: flex;
	flex-direction: column;
}
.content-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
}
.custom-timeline {
	width: 100%;
	margin-top: 30px;
	max-height: calc(100vh - 200px);
	overflow-y: auto;
}

::v-deep .el-timeline-item__tail {
	left: 6px;
	margin-top: 10px;
}

::v-deep .el-timeline-item__timestamp.is-top {
	margin-bottom: 3px;
}

::v-deep .el-timeline-item {
	padding-bottom: 40px;
}

/* 自定义滚动条样式 */
.custom-timeline::-webkit-scrollbar {
	width: 6px;
}

.custom-timeline::-webkit-scrollbar-thumb {
	background-color: #909399;
	border-radius: 3px;
}

.custom-timeline::-webkit-scrollbar-track {
	background-color: #f5f7fa;
}

.time-period-header {
	margin-top: 10px;
	margin-bottom: 10px;
	background-color: rgb(229 246 255);
	.el-button {
		margin-right: 20px;
	}
	.el-switch {
		margin-right: 20px;
	}
}
.time-period-title {
	font-size: 16px;
	margin-left: 50px;
	margin-top: 15px;
	margin-bottom: 15px;
	font-weight: bold;
}

.empty-data {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	min-height: 400px;
	text-align: center;
}

.empty-icon {
	font-size: 80px;
	color: #c0c4cc;
	margin-bottom: 20px;
}

.empty-text {
	font-size: 24px;
	font-weight: bold;
	color: #606266;
}
</style>
