<template>
	<div>
		<el-drawer
			title="授权时区及周期批量修改"
			:visible.sync="visible"
			:before-close="handleClose"
			size="40%"
			>
			<el-table
				:data="tableData"
				:key="tableData.key"
				>
				<el-table-column label="线路名称" prop="lineName" width="120"></el-table-column>
				<el-table-column label="授权时区" prop="timeZone">
					<template #default="{row}">
						<el-select v-model="row.timeCode">
							<el-option
								v-for="item in row.timeZones"
								:key="item.value"
								:label="item.label"
								:value="item.value"></el-option>
						</el-select>
					</template>
					
				</el-table-column>
				<el-table-column label="授权周期" prop="authCycle">
					<template #default="{row}">
						<el-date-picker
							v-model="row.dateRange"
							type="daterange"
							range-separator="至"
							start-placeholder="开始日期"
							end-placeholder="结束日期"
							:picker-options="pickerOptions"
							value-format="yyyy-MM-dd">
						</el-date-picker>
					</template>
				</el-table-column>
			</el-table>
			<div class="drawer-footer">
				<el-button type="primary" @click="handleSave">确定</el-button>
				<el-button @click="visible = false">取消</el-button>
			</div>
		</el-drawer>
	</div>
</template>
<script>
import * as TimePeriodApi from '@/api/nacs/time_period';
import { getLineDatas } from '@/utils/dict'
export default {
	name: "authTimeToLine",
	data() {
		return {
			visible: false,
			tableData: [],
			timeZones: [{ value:0, label:'全时区' }],
			pickerOptions: {
				shortcuts: [{
					text: "一天",
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24);
						picker.$emit("pick", [start, end]);
					}
				}, {
					text: "一周",
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
						picker.$emit("pick", [start, end]);
					}
				}, {
					text: "一月",
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
						picker.$emit("pick", [start, end]);
					}
				},{
					text: "一年",
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
						picker.$emit("pick", [start, end]);
					}
				},{
					text: "十年",
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 365 * 10);
						picker.$emit("pick", [start, end]);
					}
				}]
			},
			lineMap: getLineDatas(),
		}
	},
	methods: {
		async show(data) {
			this.visible = true;
			this.tableData = []; // 清空原有数据

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
			
			if (data && Array.isArray(data)) {
				const promises = data.map(async lineNo => {
					try {
						const res = await TimePeriodApi.getTimePeriod(lineNo);
						if (res.data && res.data.length > 0) {
							return {
								lineName: this.lineMap.find(line => line.lineNo === lineNo).name,
								dateRange: [startDate, endDate],
								key: lineNo,
								timeCode: res.data[0].timeCode, // 添加默认值
								timeZones: res.data.map(item => ({
									value: item.timeCode,
									label: item.timeName
								}))
							};
						} else {
							return {
								lineName: this.lineMap.find(line => line.lineNo === lineNo).name,
								dateRange: [startDate, endDate],
								key: lineNo,
								timeCode: 0,
								timeZones: [{value: 0, label: '全时区'}] // 添加默认时区
							};
						}
					} catch (error) {
						console.error(`获取线路${lineNo}时区失败:`, error);
					}
				});
				this.tableData = await Promise.all(promises);
			}
			console.log(this.tableData);
		},
		handleClose() {
			this.visible = false;
			this.form = {
				timeCode: 0,
				dateRange: [],
				key: "",
				lineNo: "",
			};
			this.tableData = [];
		},
		handleSave() {
			const params = this.tableData.map(item => {
				return {
					lineNo: item.key,
					timeCode: item.timeCode,
					startDate: item.dateRange[0],
					endDate: item.dateRange[1],
				}
			});
			console.log(params);
			this.$emit("confirm", params);
			this.visible = false;
		}
	}
}
</script>
<style lang="css" scoped>
::v-deep .el-table {
	width: calc(100% - 60px);
	margin-left: 30px;
	margin-right: 30px;
	position: relative;
	height: 600px !important;

	
}
::v-deep .el-table .el-table__body-wrapper {
	height: calc(100% - 60px) !important;
}
.drawer-footer {
	position: absolute;
	bottom: 20px;
	right: 30px;
}
</style>