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
						<el-select v-model="row.timePeriodId">
							<el-option
								v-for="item in timeZones"
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
		show(data) {
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
			
			const startTime = formatDate(today);
			const endTime = formatDate(tenYearsLater);
			
			if (data && Array.isArray(data)) {
				data.forEach(lineNo => {
					this.tableData.push({
						lineName: this.lineMap.find(line => line.lineNo === lineNo).name,
						timePeriodId: 0,
						dateRange: [startTime, endTime],
						key: lineNo // 添加唯一key
					});
				});
			}
			console.log(this.tableData);
		},
		handleClose() {
			this.visible = false;
			this.form = {
				timePeriodId: 0,
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
					timePeriodId: item.timePeriodId,
					startTime: item.dateRange[0],
					endTime: item.dateRange[1],
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