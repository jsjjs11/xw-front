<template>
	<div>
		<!-- 审核对话框 -->
    <el-dialog
      title="审核处理"
      :visible.sync="auditDialogVisible"
      width="600px"
			ref="formRef">
      <el-form label-width="100px">
        <el-form-item label="审核单号">
          <el-input v-model="currentAudit.checkId" readonly></el-input>
        </el-form-item>
        <el-form-item label="申请人">
          <el-input v-model="currentAudit.applyUser" readonly></el-input>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-input v-model="currentAudit.applyTime" readonly></el-input>
        </el-form-item>
        <el-form-item label="门禁卡号">
          <el-input v-model="currentAudit.cardId" readonly></el-input>
        </el-form-item>
        <el-form-item label="线路名称">
          <el-input v-model="currentAudit.lineName" readonly></el-input>
        </el-form-item>
        <el-form-item label="权限类型">
          <el-input v-model="currentAudit.accessType" readonly></el-input>
        </el-form-item>
        <el-form-item label="申请内容">
          <el-input
            type="textarea"
            :rows="4"
            v-model="currentAudit.checkContent"
            readonly></el-input>
        </el-form-item>
        <!-- <el-form-item label="申请原因">
          <el-input
            type="textarea"
            :rows="3"
            v-model="currentAudit.applyReason"
            readonly></el-input>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="auditDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="showRejectDialog">驳 回</el-button>
        <el-button type="success" @click="handleApprove">通 过</el-button>
      </span>
    </el-dialog>

    <!-- 驳回原因对话框 -->
    <el-dialog
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
    </el-dialog>
	</div>
</template>
<script>
import * as CheckApi from '@/api/nacs/check'
export default {
	name: 'checkForm',
	data() {
		return {
			auditDialogVisible: false,
      rejectDialogVisible: false,
      currentAudit: {},
      rejectForm: {
        reason: ''
      },
      rejectRules: {
        reason: [
          { required: true, message: '请输入驳回原因', trigger: 'blur' }
        ]
      },
      currentAudit: {
        checkId: '',
        applyUser: '',
        applyTime: '',
        cardId: '',
        lineName: '',
        accessType: '',
        checkContent: '',
        applyReason: ''
      },
		}
	},
	methods: {
		async open(id) {
			try {
        // 调用API获取审核详情
        const res = await CheckApi.getCheckDetail(id);
        this.currentAudit = res.data;
        this.auditDialogVisible = true;
      } catch (error) {
        console.error("获取审核详情失败", error);
        this.$message.error("获取审核详情失败");
      }
		},
		showRejectDialog() {
      this.auditDialogVisible = false
      this.rejectDialogVisible = true
    },
		handleApprove() {
      this.$confirm('确认通过该申请吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.updateStatus('1', '审核通过成功')
      })
    },
		handleReject() {
      this.$refs.rejectForm.validate(valid => {
        if (valid) {
          this.updateStatus('2', '驳回成功')
        }
      })
    },
		updateStatus(status, msg) {
      const index = this.tableData.findIndex(
        item => item.checkId === this.currentAudit.checkId
      )
      if (index > -1) {
        this.tableData[index].checkStatus = status
        if (status === '2') {
          this.tableData[index].rejectReason = this.rejectForm.reason
        }
        this.$message.success(msg)
        this.auditDialogVisible = false
        this.rejectDialogVisible = false
      }
    },
	}
}
</script>