<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="100px">
                    <el-form-item label="线路ID" prop="lineId">
                      <el-input v-model="formData.lineId" placeholder="请输入线路ID" />
                    </el-form-item>
                    <el-form-item label="员工编号" prop="employeeCode">
                      <el-input v-model="formData.employeeCode" placeholder="请输入员工编号" />
                    </el-form-item>
                    <el-form-item label="员工姓名" prop="employeeName">
                      <el-input v-model="formData.employeeName" placeholder="请输入员工姓名" />
                    </el-form-item>
                    <el-form-item label="卡号" prop="cardNo">
                      <el-input v-model="formData.cardNo" placeholder="请输入卡号" />
                    </el-form-item>
                    <el-form-item label="设备编号" prop="deviceCode">
                      <el-input v-model="formData.deviceCode" placeholder="请输入设备编号" />
                    </el-form-item>
                    <el-form-item label="设备名称" prop="deviceName">
                      <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
                    </el-form-item>
                    <el-form-item label="门禁点名称" prop="dApName">
                      <el-input v-model="formData.dApName" placeholder="请输入门禁点名称" />
                    </el-form-item>
                    <el-form-item label="事件时间" prop="eventTime">
                      <el-date-picker clearable v-model="formData.eventTime" type="date" value-format="timestamp" placeholder="选择事件时间" />
                    </el-form-item>
                    <el-form-item label="告警事件类型" prop="eventId">
                      <el-input v-model="formData.eventId" placeholder="请输入告警事件类型" />
                    </el-form-item>
                    <el-form-item label="告警事件名称" prop="eventName">
                      <el-input v-model="formData.eventName" placeholder="请输入告警事件名称" />
                    </el-form-item>
                    <el-form-item label="告警事件详情" prop="remark">
                      <el-input v-model="formData.remark" placeholder="请输入告警事件详情" />
                    </el-form-item>
                    <el-form-item label="备用字段1" prop="bkField1">
                      <el-input v-model="formData.bkField1" placeholder="请输入备用字段1" />
                    </el-form-item>
      </el-form>
              <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :disabled="formLoading">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as EventCardWarningApi from '@/api/nacs/eventcardwarning';
      export default {
    name: "EventCardWarningForm",
    components: {
                    },
    data() {
      return {
        // 弹出层标题
        dialogTitle: "",
        // 是否显示弹出层
        dialogVisible: false,
        // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
        formLoading: false,
        // 表单参数
        formData: {
                            id: undefined,
                            lineId: undefined,
                            employeeCode: undefined,
                            employeeName: undefined,
                            cardNo: undefined,
                            deviceCode: undefined,
                            deviceName: undefined,
                            dApName: undefined,
                            eventTime: undefined,
                            eventId: undefined,
                            eventName: undefined,
                            remark: undefined,
                            bkField1: undefined,
        },
        // 表单校验
        formRules: {
                        lineId: [{ required: true, message: '线路ID不能为空', trigger: 'blur' }],
                        employeeCode: [{ required: true, message: '员工编号不能为空', trigger: 'blur' }],
                        employeeName: [{ required: true, message: '员工姓名不能为空', trigger: 'blur' }],
                        cardNo: [{ required: true, message: '卡号不能为空', trigger: 'blur' }],
                        deviceCode: [{ required: true, message: '设备编号不能为空', trigger: 'blur' }],
                        deviceName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
                        dApName: [{ required: true, message: '门禁点名称不能为空', trigger: 'blur' }],
                        eventTime: [{ required: true, message: '事件时间不能为空', trigger: 'blur' }],
                        eventId: [{ required: true, message: '告警事件类型不能为空', trigger: 'blur' }],
                        eventName: [{ required: true, message: '告警事件名称不能为空', trigger: 'blur' }],
                        remark: [{ required: true, message: '告警事件详情不能为空', trigger: 'blur' }],
        },
                        };
    },
    methods: {
      /** 打开弹窗 */
     async open(id) {
        this.dialogVisible = true;
        this.reset();
        // 修改时，设置数据
        if (id) {
          this.formLoading = true;
          try {
            const res = await EventCardWarningApi.getEventCardWarning(id);
            this.formData = res.data;
            this.title = "修改该表存储员工门禁告警事件相关信息";
          } finally {
            this.formLoading = false;
          }
        }
        this.title = "新增该表存储员工门禁告警事件相关信息";
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
            await EventCardWarningApi.updateEventCardWarning(data);
            this.$modal.msgSuccess("修改成功");
            this.dialogVisible = false;
            this.$emit('success');
            return;
          }
          // 添加的提交
          await EventCardWarningApi.createEventCardWarning(data);
          this.$modal.msgSuccess("新增成功");
          this.dialogVisible = false;
          this.$emit('success');
        } finally {
          this.formLoading = false;
        }
      },
                      /** 表单重置 */
      reset() {
        this.formData = {
                            id: undefined,
                            lineId: undefined,
                            employeeCode: undefined,
                            employeeName: undefined,
                            cardNo: undefined,
                            deviceCode: undefined,
                            deviceName: undefined,
                            dApName: undefined,
                            eventTime: undefined,
                            eventId: undefined,
                            eventName: undefined,
                            remark: undefined,
                            bkField1: undefined,
        };
        this.resetForm("formRef");
      }
    }
  };
</script>