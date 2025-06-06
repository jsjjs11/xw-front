<template>
	<el-drawer
		title="授权时区及周期修改"
		:visible.sync="visible"
		:before-close="handleClose"
		size="30%">
		<el-form ref="form" :model="form" label-width="100px">
			<el-form-item label="授权时区" prop="timeZone">
				<el-select v-model="form.timeCode">
					<el-option
						v-for="item in timeZones"
						:key="item.value"
						:label="item.label"
						:value="item.value"></el-option>
				</el-select>
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
		</el-form>
		<div class="drawer-footer">
			<el-button type="primary" @click="handleSave">确定</el-button>
			<el-button @click="visible = false">取消</el-button>
		</div>
	</el-drawer>
	
</template>
<script>
export default {
	name: "AuthTimeEditForm",
	data() {
		return {
			visible: false,
			form: {
				timeCode: 0,
				dateRange: [],
				key: ""
			},
			quickButtons: [
				{ type: 'day', label: '一天' },
        { type: 'week', label: '一周' },
        { type: 'month', label: '一月' },
        { type: 'year', label: '一年' },
        { type: 'decade', label: '十年' }
			],
			timeZones: [{ value:0, label:'全时区' }]
		}
	},
	methods: {
		show (row) {
			this.visible = true;
			this.form = {
				timeCode: row.timeCode || 0,
				dateRange: [row.startDate, row.endDate] || [],
				key: row.key
			}
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
		handleClose() {
			this.visible = false;
		},
		handleSave() {
			const result = {
				timeCode: this.form.timeCode || 0,
				startDate: this.formatDate(this.form.dateRange[0]),
				endDate: this.formatDate(this.form.dateRange[1]),
				key: this.form.key
			};
			// console.log(result);
			this.$emit('confirm', result);
			this.visible = false;
		},
		formatDate(date) {
			if (!date) return '';
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
    },
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
.drawer-footer {
	position: absolute;
	bottom: 20px;
	right: 20px;
}
</style>