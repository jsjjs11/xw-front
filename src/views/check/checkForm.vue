<template>
	<div>
		<!-- 审核对话框 -->
    <el-dialog
      title="审核处理"
      :visible.sync="auditDialogVisible"
      width="600px"
			ref="formRef">
      <el-form label-width="100px">
        <el-form-item label="审核意见">
          <el-input
            type="textarea"
            :rows="3"
            v-model="currentAudit.remark"
            placeholder="请输入审核意见"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="showRejectDialog">驳 回</el-button>
        <el-button type="success" @click="handleApprove">通 过</el-button>
      </span>
    </el-dialog>

    <!-- 驳回原因对话框 -->
    <!-- <el-dialog
      title="填写驳回原因"
      :visible.sync="rejectDialogVisible"
      width="500px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectForm">
        <el-form-item label="驳回原因" prop="reason">
          <el-input
            type="textarea"
            :rows="3"
            v-model="rejectForm.reason"
            placeholder="请输入详细的驳回原因"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleReject">确 定</el-button>
      </span>
    </el-dialog> -->
	</div>
</template>
<script>
import * as CheckApi from '@/api/nacs/check'
export default {
	name: 'checkForm',
	data() {
		return {
			auditDialogVisible: false,
      // rejectDialogVisible: false,
      currentAudit: {},
      // rejectForm: {
      //   reason: ''
      // },
      // rejectRules: {
      //   reason: [
      //     { required: true, message: '请输入驳回原因', trigger: 'blur' }
      //   ]
      // },
      currentAudit: {
        remark: '',
      },
      params:{
        id: 0,
        idCard: "",
        authNo: "",
        reviewState: 0,
        reviewContent: "",
        leaderUserId: "",
        remark: ""
      },
		}
	},
	methods: {
		open(data) {
      this.auditDialogVisible = true;
      this.params.id = data.id;
      this.params.idCard = data.idCard;
      this.params.authNo = data.authNo;
      this.params.reviewState = data.reviewState;
      this.params.reviewContent = data.reviewContent;
      const userId = this.$store.getters.userId;
      this.params.leaderUserId = userId;
      console.log(this.params)
		},
		showRejectDialog() {
      this.auditDialogVisible = false
      this.rejectDialogVisible = true
    },
		async handleApprove() {
      this.$confirm('确认通过该申请吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.params.remark = this.currentAudit.remark;
        try {
          CheckApi.reviewCheck(this.params)
          this.auditDialogVisible = false
        } catch (error) {
          this.$message.error('审核失败，请重试')
        }
        // this.updateStatus('1', '审核通过成功')
      })
    },
		async handleReject() {
      this.$refs.rejectForm.validate(valid => {
        if (valid) {
          this.params.remark = this.currentAudit.remark;
          try {
            CheckApi.reviewCheck(this.params)
            this.auditDialogVisible = false
          } catch (error) {
            this.$message.error('审核失败，请重试')
          }
          // this.updateStatus('2', '驳回成功')
        }
      })
    },
		// updateStatus(status, msg) {
    //   const index = this.tableData.findIndex(
    //     item => item.authNo === this.currentAudit.authNo
    //   )
    //   if (index > -1) {
    //     this.tableData[index].checkStatus = status
    //     if (status === '2') {
    //       this.tableData[index].rejectReason = this.rejectForm.reason
    //     }
    //     this.$message.success(msg)
    //     this.auditDialogVisible = false
    //     // this.rejectDialogVisible = false
    //   }
    // },
	}
}
</script>