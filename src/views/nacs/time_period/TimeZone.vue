<template>
	<div class="app-container">
		<el-dialog :title=dialogTitle :visible.sync="dialogVisible" width="45%" :before-close="handleClose">
			<el-form ref="timeForm" :model="timeForm" label-width="100px" :rules="rules" v-loading="formLoading">
				<el-form-item label="时区名称" prop="name">
					<el-input v-model="timeForm.name" placeholder="请输入名称" :disabled="isViewMode"></el-input>
				</el-form-item>
				<el-form-item label="编号" prop="id">
					<el-input v-model="timeForm.id" placeholder="请输入编号" :disabled="isViewMode"></el-input>
				</el-form-item>
				<el-form-item label="创建人" prop="creator">
					<el-input v-model="timeForm.creator" placeholder="请输入创建人" :disabled="isViewMode"></el-input>
				</el-form-item>
				<!-- <el-form-item label="有效日期" prop="dateRange">
					<el-row :gutter="9">
						<el-col :span="10" >
							<el-date-picker v-model="timeForm.startTime" 
								type="date" 
								placeholder="开始日期" 
								value-format="yyyy-MM-dd" 
								style="width: 100%;" 
								:disabled="isViewMode"></el-date-picker>
						</el-col> -->
						<!-- 分隔符 -->
						<!-- <el-col :span="2" class="date-separator">
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
				</el-form-item> -->
				
				<el-form-item label="时间段设置">
					<el-button type="primary" size="small" icon="el-icon-plus"	@click="addTimeRange" plain></el-button>
				</el-form-item>
				<el-form-item
					v-for="(timeRange, index) in timeForm.timeRanges"
					:key="index"
					:label="`时间段${index + 1}`"
					:prop="`timeRanges.${index}`"
					>
					<el-checkbox :indeterminate="isIndeterminate[index]" v-model="checkAll[index]" @change="(val) => handleCheckAllChange(val, index)" :disabled="isViewMode">全选</el-checkbox>
					<div style="margin: 5px 0;"></div>
					<el-checkbox-group v-model="timeRange.weekdays" @change="(val) => handleCheckedWeekdaysChange(val, index)">
						<el-checkbox v-for="item in weekdays" :label="item" :key="item" :disabled="isViewMode">{{item}}</el-checkbox>
					</el-checkbox-group>
					<el-row :gutter="10" style="margin-top: 20px;">
						<!-- 开始时间 -->
						<el-col :span="10" style="width: 38.666667%;">
							<el-time-picker
							v-model="timeRange.startTime"
							placeholder="开始时间"
							format="HH:mm:ss"
							value-format="HH:mm:ss"
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
								format="HH:mm:ss"
								value-format="HH:mm:ss"
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
	name: 'TimeZone',
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
				// startTime: '',
				// endTime: '',
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
			},
			weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
			checkAll: [],
			isIndeterminate: [],
			isViewMode: false,
		}
	},
	mounted() {
		this.checkAll = this.timeForm.timeRanges.map(() => false);
		this.isIndeterminate = this.timeForm.timeRanges.map(() => false);
	},
	methods: {
		/** 打开弹窗 */
		async openForm() {
			this.dialogVisible = true;
			this.reset();
			this.title = "新增时区";
		},
		
		// 全选
		handleCheckAllChange(val, index) {
			this.timeForm.timeRanges[index].weekdays = val? [...this.weekdays] : [];
			this.$set(this.isIndeterminate, index, false);
		},
		handleCheckedWeekdaysChange(val,index) {
    	const checkedCount = val.length;
			this.$set(this.checkAll, index, checkedCount === this.weekdays.length);
			this.$set(this.isIndeterminate, index, checkedCount > 0 && checkedCount < this.weekdays.length);
		},
		// 添加时间段
    addTimeRange() {
      this.timeForm.timeRanges.push({
				weekdays:[],
        startTime: '',
        endTime: '',
      });
			this.checkAll.push(false);
			this.isIndeterminate.push(false);
    },

    // 删除时间段
    removeTimeRange(index) {
      this.timeForm.timeRanges.splice(index, 1);
			this.checkAll.splice(index, 1);
      this.isIndeterminate.splice(index, 1);
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
			this.formLoading = true;
			try {
				const data = this.timeForm;
				console.log(data)
				// 添加的提交
				// await TimeApi.createTimePeriod(data);
				this.$modal.msgSuccess("新增成功");
				this.dialogVisible = false;
				this.$emit('confirm', data);
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
				// startTime: '',
				// endTime: '',
				timeRanges: [
					{
						weekdays: [],
						startTime: '',
						endTime: ''
					}
				]
			}
		},
		// 新增时间范围验证方法
    validateTimeRange(rule, value, callback) {
      const index = rule.index;
			if (value.weekdays.length === 0) {
				callback(new Error('请选择时间范围'))
			}
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