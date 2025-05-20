<template>
	<div class="app-container">
		<el-button type = "primary" @click = "handleAddTimeZone" icon="el-icon-plus">创建新时区</el-button>
		<div v-for="(zone, zoneIndex) in timeZoneList" :key="zoneIndex" class="time-period-container">
			<el-row type="flex" justify="space-between" align="middle" class="time-period-header">
				<span class="time-period-title">{{ zone.timePeriodName }}</span>
				<div>
					<el-button type="text" size="mini" @click="handleZoneDelete">删除</el-button>
					<el-switch v-model="status" active-color="rgb(12 140 255)" inactive-color="#ff4949"></el-switch>
				</div>
			</el-row>
			<el-table :data="zone.tableData" border style="width: 100%">
				<el-table-column type="selection" width="50" align="center" />
				<el-table-column type="index" label="序号" width="100" align="center" />
				<el-table-column v-for="(day, index) in week" :key="index" :label="day" width="130" align="center">
					<template slot-scope="scope">
						<el-switch v-model="scope.row.timeRanges[index].status" active-color="rgb(12 140 255)" inactive-color="#ff4949"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="开始时间" prop="startTime" width="180" align="center" />
				<el-table-column label="结束时间" prop="endTime" width="180" align="center" />
				<el-table-column label="操作" prop="operation" width="calc(100% - 1420px)" align="center">
					<template slot-scope="scope">
						<el-button type="text" size="mini" @click="handleEdit(scope.row, zoneIndex)">修改</el-button>
						<el-button type="text" size="mini" @click="handleDelete(scope.row, zoneIndex)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-button @click="handleAdd(zoneIndex)" icon="el-icon-plus" style = "width:100%; margin-top:10px">增加新时段</el-button>
		</div>
		<time-zone ref="timeZoneRef" @confirm="handleTimeZoneConfirm" />
		<time-range-form ref="timerangeFormRef" @confirm="handleTimeRangeConfirm" />
	</div>
</template>
<script>
import TimeRangeForm from '@/views/nacs/time_period/TimeRangeForm.vue';
import TimeZone from '@/views/nacs/time_period/TimeZone.vue';
export default {
	name: "TimePeriod",
	components: {
		TimeRangeForm,
		TimeZone
	},
	data() {
		const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
		return {
			week: week,
			// TimeRangesName: "全时区",
			status: true,
			timeZoneList: [
				{
					timePeriodName: "全时区",
					tableData: [
						{
							timeRanges:  week.map(() => ({ status: true })),
							week,
							startTime: "00:00:00",
							endTime: "23:59:59",
						},
					]
				}
			],
			tableData: [
				{
					timeRanges:  week.map(() => ({ status: true })),
					week,
					startTime: "00:00:00",
					endTime: "23:59:59",
				},
			],
			editingRow: null,
			editingZoneIndex: null,
		}
	},
	methods: {
		handleAddTimeZone() {
			this.$refs["timeZoneRef"].openForm();
		},
		handleTimeZoneConfirm(data) {
			const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
			const tableData = data.timeRanges.map(range => {
				return {
					timeRanges: week.map(day => ({
						status: range.weekdays.includes(day)
					})),
					week: [...week],
					startTime: range.startTime || "00:00:00",
					endTime: range.endTime || "23:59:59"
				};
			});
			
			this.timeZoneList.push({
				timePeriodName: data.name,
				tableData: tableData
			});
			console.log(this.timeZoneList.tableData)
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
			this.timeZoneList[zoneIndex].tableData.push({
				timeRanges: this.createNewTimeRanges(),
				week: [...week],
				startTime: "00:00:00",
				endTime: "23:59:59",
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
			const index = this.timeZoneList[zoneIndex].tableData.findIndex(row => 
				row.startTime === this.editingRow.startTime && row.endTime === this.editingRow.endTime
			);
			if (index !== -1) {
				this.$set(this.timeZoneList[zoneIndex].tableData, index, {
					...this.timeZoneList[zoneIndex].tableData[index],
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
				const index = this.timeZoneList[zoneIndex].tableData.indexOf(row);
				if (index !== -1) {
					this.timeZoneList[zoneIndex].tableData.splice(index, 1);
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
</style>