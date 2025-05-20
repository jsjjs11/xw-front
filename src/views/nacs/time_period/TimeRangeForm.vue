<template>
	<div>
		<el-dialog
			title="时间范围修改"
			width="40%"
			:visible.sync="dialogVisible"
			:before-close="handleClose">
			<el-form :model="form" label-width="100px">
				<el-form-item label="时间范围">
					<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
					<div style="margin: 15px 0;"></div>
					<el-checkbox-group v-model="form.weekdays" @change="handleCheckedDaysChanges">
						<el-checkbox v-for="day in weekdays" :label="day" :key="day">{{ day }}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item label="开始时间">
					<el-time-picker
						v-model="form.startTime"
						placeholder="开始时间"
						format="HH:mm:ss"
    				value-format="HH:mm:ss">
					</el-time-picker>
				</el-form-item>
				<el-form-item label="结束时间">
					<el-time-picker
						v-model="form.endTime"
						placeholder="结束时间"
						format="HH:mm:ss"
    				value-format="HH:mm:ss">
					</el-time-picker>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleComfirm">确定</el-button>
				<el-button @click="dialogVisible = false">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
export default {
	name: "TimeRangeForm",
	data() {
		return {
			dialogVisible: false,
			form: {
				weekdays: [],
				startTime: "",
				endTime: "",
			},
			weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
			checkAll: false,
			isIndeterminate: false,
		};
	},
	methods: {
		show(row) {
			const weekdays = row.timeRanges ? row.timeRanges.map((item, index) => (item.status ? this.weekdays[index] : null))
										.filter(Boolean) : [] 
			this.form = {
				weekdays: weekdays,
				startTime: row.startTime,
				endTime: row.endTime,
			};
			console.log(this.form)
			// 设置全选/半选状态
			if (weekdays.length === this.weekdays.length) {
				this.checkAll = true;
				this.isIndeterminate = false;
			} else if (weekdays.length > 0) {
				this.checkAll = false;
				this.isIndeterminate = true;
			} else {
				this.checkAll = false;
				this.isIndeterminate = false;
			}
			this.dialogVisible = true;
		},
		handleClose() {
			this.form = {
				weekdays: [],
				startTime: "",
				endTime: "",
			};
			this.checkAll = false;
			this.isIndeterminate = false;
			this.dialogVisible = false;
		},
		handleCheckAllChange(val) {
			this.form.weekdays = val ? this.weekdays : [];
			this.isIndeterminate = false;
		},
		handleCheckedDaysChanges(val) {
			if (val.length === this.weekdays.length) {
				this.checkAll = true;
				this.isIndeterminate = false;
			} else if (val.length === 0) {
				this.checkAll = false;
				this.isIndeterminate = false;
			} else {
				this.checkAll = false;
				this.isIndeterminate = true;
			}
		},
		handleComfirm() {
			// 验证必填字段
			if (!this.form.startTime || !this.form.endTime) {
				this.$message.error('请填写完整的时间范围');
				return;
			}
			
			// 验证开始时间不能晚于结束时间
			if (this.form.startTime > this.form.endTime) {
				this.$message.error('开始时间不能晚于结束时间');
				return;
			}
			
			// 构建返回数据
			const result = {
				weekdays: this.form.weekdays,
				startTime: this.form.startTime,
				endTime: this.form.endTime,
				timeRanges: this.weekdays.map(day => ({
					status: this.form.weekdays.includes(day)
				}))
			};
			
			// 触发父组件事件
			this.$emit('confirm', result);
			this.dialogVisible = false;
			this.$message.success('修改成功');
		}
	}
}
</script>