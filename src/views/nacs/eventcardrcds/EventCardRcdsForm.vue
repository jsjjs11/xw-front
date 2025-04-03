<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="100px">
                    <el-form-item label="线路 ID" prop="lineId">
                      <el-input v-model="formData.lineId" placeholder="请输入线路 ID" />
                    </el-form-item>
                    <el-form-item label="员工 ID" prop="employeeId">
                      <el-input v-model="formData.employeeId" placeholder="请输入员工 ID" />
                    </el-form-item>
                    <el-form-item label="员工编号" prop="employeeCode">
                      <el-input v-model="formData.employeeCode" placeholder="请输入员工编号" />
                    </el-form-item>
                    <el-form-item label="员工姓名" prop="employeeName">
                      <el-input v-model="formData.employeeName" placeholder="请输入员工姓名" />
                    </el-form-item>
                    <el-form-item label="部门名称" prop="deptName">
                      <el-input v-model="formData.deptName" placeholder="请输入部门名称" />
                    </el-form-item>
                    <el-form-item label="刷卡卡号" prop="cardNo">
                      <el-input v-model="formData.cardNo" placeholder="请输入刷卡卡号" />
                    </el-form-item>
                    <el-form-item label="设备编号" prop="deviceCode">
                      <el-input v-model="formData.deviceCode" placeholder="请输入设备编号" />
                    </el-form-item>
                    <el-form-item label="设备名称" prop="deviceName">
                      <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
                    </el-form-item>
                    <el-form-item label="门禁访问点名称" prop="dApName">
                      <el-input v-model="formData.dApName" placeholder="请输入门禁访问点名称" />
                    </el-form-item>
                    <el-form-item label="事件 ID(平台)" prop="eventId">
                      <el-input v-model="formData.eventId" placeholder="请输入事件 ID(平台)" />
                    </el-form-item>
                    <el-form-item label="事件名称(平台)" prop="eventName">
                      <el-input v-model="formData.eventName" placeholder="请输入事件名称(平台)" />
                    </el-form-item>
                    <el-form-item label="事件时间" prop="eventTime">
                      <el-date-picker clearable v-model="formData.eventTime" type="date" value-format="timestamp" placeholder="选择事件时间" />
                    </el-form-item>
                    <el-form-item label="0 - 正常，1 - 未授权" prop="result">
                      <el-select v-model="formData.result" placeholder="请选择0 - 正常，1 - 未授权">
                            <el-option label="请选择字典生成" value="" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="备用字段 1" prop="bkField1">
                      <el-input v-model="formData.bkField1" placeholder="请输入备用字段 1" />
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
  import * as EventCardRcdsApi from '@/api/nacs/eventcardrcds';
      export default {
    name: "EventCardRcdsForm",
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
                            employeeId: undefined,
                            employeeCode: undefined,
                            employeeName: undefined,
                            deptName: undefined,
                            cardNo: undefined,
                            deviceCode: undefined,
                            deviceName: undefined,
                            dApName: undefined,
                            eventId: undefined,
                            eventName: undefined,
                            eventTime: undefined,
                            result: undefined,
                            bkField1: undefined,
        },
        // 表单校验
        formRules: {
                        lineId: [{ required: true, message: '线路 ID不能为空', trigger: 'blur' }],
                        employeeId: [{ required: true, message: '员工 ID不能为空', trigger: 'blur' }],
                        employeeCode: [{ required: true, message: '员工编号不能为空', trigger: 'blur' }],
                        employeeName: [{ required: true, message: '员工姓名不能为空', trigger: 'blur' }],
                        deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
                        cardNo: [{ required: true, message: '刷卡卡号不能为空', trigger: 'blur' }],
                        deviceCode: [{ required: true, message: '设备编号不能为空', trigger: 'blur' }],
                        deviceName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
                        dApName: [{ required: true, message: '门禁访问点名称不能为空', trigger: 'blur' }],
                        eventId: [{ required: true, message: '事件 ID(平台)不能为空', trigger: 'blur' }],
                        eventName: [{ required: true, message: '事件名称(平台)不能为空', trigger: 'blur' }],
                        eventTime: [{ required: true, message: '事件时间不能为空', trigger: 'blur' }],
                        result: [{ required: true, message: '0 - 正常，1 - 未授权不能为空', trigger: 'change' }],
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
            const res = await EventCardRcdsApi.getEventCardRcds(id);
            this.formData = res.data;
            this.title = "修改门禁卡通行记录";
          } finally {
            this.formLoading = false;
          }
        }
        this.title = "新增门禁卡通行记录";
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
            await EventCardRcdsApi.updateEventCardRcds(data);
            this.$modal.msgSuccess("修改成功");
            this.dialogVisible = false;
            this.$emit('success');
            return;
          }
          // 添加的提交
          await EventCardRcdsApi.createEventCardRcds(data);
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
                            employeeId: undefined,
                            employeeCode: undefined,
                            employeeName: undefined,
                            deptName: undefined,
                            cardNo: undefined,
                            deviceCode: undefined,
                            deviceName: undefined,
                            dApName: undefined,
                            eventId: undefined,
                            eventName: undefined,
                            eventTime: undefined,
                            result: undefined,
                            bkField1: undefined,
        };
        this.resetForm("formRef");
      }
    }
  };
</script>