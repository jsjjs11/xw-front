<template>
	<div class="app-container">
		<el-dialog :title=dialogTitle :visible.sync="dialogVisible" width="40%" :before-close="handleClose">
			<el-form ref="timeForm" :model="timeForm" label-width="100px" :rules="rules" v-loading="formLoading">
				<el-form-item label="名称" prop="name">
					<el-input v-model="timeForm.name" placeholder="请输入名称" :disabled="isViewMode"></el-input>
				</el-form-item>
				<el-form-item label="编号" prop="id">
					<el-input v-model="timeForm.id" placeholder="请输入编号" :disabled="isViewMode"></el-input>
				</el-form-item>
				<el-form-item label="创建人" prop="creator">
					<el-input v-model="timeForm.creator" placeholder="请输入创建人" :disabled="isViewMode"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input v-model="timeForm.description" placeholder="请输入描述" :disabled="isViewMode"></el-input>
				</el-form-item>
				<el-form-item label="有效日期" prop="dateRange">
					<el-row :gutter="9">
						<el-col :span="10" >
							<el-date-picker v-model="timeForm.startTime" 
								type="date" 
								placeholder="开始日期" 
								value-format="yyyy-MM-dd" 
								style="width: 100%;" 
								:disabled="isViewMode"></el-date-picker>
						</el-col>
						<!-- 分隔符 -->
						<el-col :span="2" class="date-separator">
							<span style="font-size: 16px; color: #606266">--</span>
						</el-col>
						<el-col :span="10" >
							<el-date-picker v-model="timeForm.endTime" 
							type="date" 
							placeholder="结束日期" 
							value-format="yyyy-MM-dd" 
							style="width: 100%;" 
							:disabled="isViewMode"></el-date-picker>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item label="工作日设置" prop="workDays">
					<el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange" :disabled="isViewMode">全选</el-checkbox>
					<div style="margin: 15px 0;"></div>
					<el-checkbox-group v-model="timeForm.workDays" @change="handleCheckedWorkDaysChange">
						<el-checkbox v-for="item in workDays" :label="item" :key="item" :disabled="isViewMode">{{item}}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item label="时间段设置">
					<el-button type="primary" size="small" icon="el-icon-plus"	@click="addTimeRange" plain></el-button>
				</el-form-item>
				<el-form-item
					v-for="(timeRange, index) in timeForm.timeRanges"
					:key="index"
					:label="`时间段${index + 1}`"
					:prop="`timeRanges.${index}`"
					:rules="{
            validator: validateTimeRange,
            index: index,
            trigger: 'change'
          }">
					<el-row :gutter="10">
						<!-- 开始时间 -->
						<el-col :span="10" style="width: 38.666667%;">
							<el-time-picker
							v-model="timeRange.startTime"
							placeholder="开始时间"
							format="HH:mm"
							value-format="HH:mm"
							:picker-options="{selectableRange: getStartRange(index)}"
							style="width: 100%"
							:disabled="isViewMode"/>
						</el-col>
						
						<!-- 分隔符 -->
						<el-col :span="2" class="date-separator">
							<span style="font-size: 16px; color: #606266">--</span>
						</el-col>

						<!-- 结束时间 -->
						<el-col :span="10" style="width: 38.666667%;">
							<el-time-picker
								v-model="timeRange.endTime"
								placeholder="结束时间"
								format="HH:mm"
								value-format="HH:mm"
								:disabled="!timeRange.startTime"
								:picker-options="{selectableRange: getEndRange(index)}"
								style="width: 100%"
							  />
						</el-col>

						<!-- 删除按钮 -->
						<el-col :span="2">
							<el-button
								type="danger"
								icon="el-icon-delete"
								circle
								size="mini"
								@click="removeTimeRange(index)"
								v-show="timeForm.timeRanges.length > 1"
							/>
						</el-col>
					</el-row>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="submitForm">确定</el-button>
				<el-button @click="dialogVisible = false">取消</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import * as TimeApi from '@/api/nacs/time_period';
export default {
	name: 'TimeForm',
	data() {
		return {
			// 弹出层标题
			dialogTitle: "",
			dialogVisible: false,
			formLoading: false,
			timeForm: {
				name: '',
				id: '',
				creator: '',
				description: '',
				startTime: '',
				endTime: '',
				workDays: [],
				timeRanges: []
			},
			rules: {
				name: [
					{ required: true, message: '请输入名称', trigger: 'blur' }
				],
				id: [
					{ required: true, message: '请输入编号', trigger: 'blur' }
				],
				creator: [
					{ required: true, message: '请输入创建人', trigger: 'blur' }
				],
				dateRange: [
					{
						validator: (rule, value, callback) => {
							if (!this.timeForm.startTime || !this.timeForm.endTime) {
								callback(new Error('请选择完整日期范围'))
							} else if (new Date(this.timeForm.startTime) > new Date(this.timeForm.endTime)) {
								callback(new Error('结束日期不能早于开始日期'))
							} else {
								callback()
							}
						},
						trigger: ['change', 'blur']
					}
				],
				workDays: [
					{ required: true, message: '请选择工作日', trigger: 'change' }
				],
			},
			timeRangeRules: {
        validator: (rule, value, callback) => {
          if (!value.startTime || !value.endTime) {
            callback(new Error('请填写完整时间段'))
          } else if (this.compareTime(value.startTime, value.endTime) >= 0) {
            callback(new Error('结束时间必须晚于开始时间'))
          } else {
            callback()
          }
        },
        trigger: 'change'
      },
			startRanges: [],
			endRanges: [],
			workDays: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
			checkAll: false,
			isIndeterminate: false,
			isViewMode: false,
		}
	},
	methods: {
		/** 打开弹窗 */
		async openForm(id) {
			this.dialogVisible = true;
			this.reset();
			// 修改时，设置数据
			if (id) {
				this.formLoading = true;
				try {
					const res = await TimeApi.getTimePeriod(id);
					this.timeForm = res.data;
					this.title = "修改时间段";
				} finally {
					this.formLoading = false;
				}
			}
			this.title = "新增时间段";
		},
		async checkForm(id) {
			this.dialogVisible = true;
			if (id) {
				this.formLoading = true;
				try {
					const res = await TimeApi.getTimePeriod(id);
					this.timeForm = res.data;
					this.isViewMode = true;
					this.title = "查看时间段";
				} finally {
					this.formLoading = false;
				}
			}
		},
		// 全选
		handleCheckAllChange(val) {
			this.isIndeterminate = false
			this.timeForm.workDays = val ? this.workDays : []
		},
		handleCheckedWorkDaysChange(val) {
			const checkedCount = val.length
			this.checkAll = checkedCount === this.workDays.length
			this.isIndeterminate = checkedCount > 0 && checkedCount < this.workDays.length // 关键修改
		},
		// 添加时间段
    addTimeRange() {
      this.timeForm.timeRanges.push({
        startTime: '',
        endTime: ''
      })
    },

    // 删除时间段
    removeTimeRange(index) {
      this.timeForm.timeRanges.splice(index, 1)
    },

    // 比较时间大小（HH:mm格式）
    compareTime(time1, time2) {
      const [h1, m1] = time1.split(':').map(Number)
      const [h2, m2] = time2.split(':').map(Number)
      return h1 !== h2 ? h1 - h2 : m1 - m2
    },

    // 获取开始时间可选范围
    getStartRange(index) {
      if (!this.timeForm.timeRanges[index].endTime) return '00:00:00 - 23:59:59'
      const endTime = this.timeForm.timeRanges[index].endTime
      return `00:00:00 - ${endTime}:59`
    },

    // 获取结束时间可选范围
    getEndRange(index) {
      if (!this.timeForm.timeRanges[index].startTime) return '00:00:00 - 23:59:59'
      const startTime = this.timeForm.timeRanges[index].startTime
      return `${startTime}:00 - 23:59:59`
    },
		/** 提交按钮 */
		async submitForm() {
			// 校验主表
			await this.$refs["formRef"].validate();
				this.formLoading = true;
			try {
				const data = this.formData;
				// 修改的提交
				if (data.id) {
					await TimeApi.updateTimePeriod(data);
					this.$modal.msgSuccess("修改成功");
					this.dialogVisible = false;
					this.$emit('success');
					return;
				}
				// 添加的提交
				await TimeApi.createTimePeriod(data);
				this.$modal.msgSuccess("新增成功");
				this.dialogVisible = false;
				this.$emit('success');
			} finally {
				this.formLoading = false;
			}
		},
		handleClose() {
      this.dialogVisible = false;
      this.reset();
    },
		reset() {
			this.timeForm = {
				name: '',
				id: '',
				creator: '',
				description: '',
				startTime: '',
				endTime: '',
				workDays: [],
				timeRanges: [
					{
						startTime: '',
						endTime: ''
					}
				]
			}
		},
		// 新增时间范围验证方法
    validateTimeRange(rule, value, callback) {
      const index = rule.index;
      if (!value.startTime || !value.endTime) {
        callback(new Error('请填写完整时间段'));
      } else if (this.compareTime(value.startTime, value.endTime) >= 0) {
        callback(new Error('结束时间必须晚于开始时间'));
      } else {
        // 检查时间范围是否重叠
        if (this.hasOverlap(index)) {
          callback(new Error('时间段不能重叠'));
        } else {
          callback();
        }
      }
    },
    
    // 新增检查时间重叠方法
    hasOverlap(currentIndex) {
      const current = this.timeForm.timeRanges[currentIndex];
      if (!current.startTime || !current.endTime) return false;
      
      return this.timeForm.timeRanges.some((range, index) => {
        if (index === currentIndex || !range.startTime || !range.endTime) {
          return false;
        }
        return !(
          this.compareTime(current.endTime, range.startTime) <= 0 ||
          this.compareTime(current.startTime, range.endTime) >= 0
        );
      });
    },
	}
}
</script>
<style lang="scss" scoped>
.date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px; /* 与输入框高度保持一致 */
}
</style>