<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="160px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="线路ID" prop="lineId">
              <el-input v-model="formData.lineId" placeholder="请输入线路ID" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="物理卡号" prop="cardId">
              <el-input v-model="formData.cardId" placeholder="请输入物理卡号" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="虚拟卡号" prop="cardMapBcd">
              <el-input v-model="formData.cardMapBcd" placeholder="请输入虚拟卡号" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="线路侧中间表上传的卡号" prop="cardNo">
              <el-input v-model="formData.cardNo" placeholder="请输入线路侧中间表上传的卡号" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="持卡人ID" prop="employeeId">
              <el-input v-model="formData.employeeId" placeholder="请输入持卡人ID" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="持卡人编号ID" prop="employeeCode">
              <el-input v-model="formData.employeeCode" placeholder="请输入持卡人编号ID" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="持卡人姓名" prop="employeeName">
              <el-input v-model="formData.employeeName" placeholder="请输入持卡人姓名" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="持卡人身份证号" prop="idCard">
              <el-input v-model="formData.idCard" placeholder="请输入持卡人身份证号" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="卡类型" prop="cardType">
              <el-select v-model="formData.cardType" placeholder="请选择卡类型" class="input-width">
                <el-option v-for="dict in this.getDictDatas(DICT_TYPE.NACS_CARD_TYPE)"
                           :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="卡状态" prop="cardState">
              <el-select v-model="formData.cardState" placeholder="请选择卡状态" class="input-width">
                <el-option v-for="dict in this.getDictDatas(DICT_TYPE.NACS_CARD_STATE)" :key="dict.value"
                  :label="dict.label" :value="parseInt(dict.value)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="有效时间" prop="startDate">
              <el-date-picker clearable v-model="formData.startDate" type="date" value-format="timestamp"
                placeholder="选择有效时间" class="input-width" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="失效时间" prop="endDate">
              <el-date-picker clearable v-model="formData.endDate" type="date" value-format="timestamp"
                placeholder="选择失效时间" class="input-width" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :disabled="formLoading">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
  import * as CardsApi from '@/api/nacs/cards';
      export default {
    name: "CardsForm",
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
                            cardId: undefined,
                            cardMapBcd: undefined,
                            cardNo: undefined,
                            employeeId: undefined,
                            employeeCode: undefined,
                            employeeName: undefined,
                            idCard: undefined,
                            cardType: undefined,
                            cardState: undefined,
                            startDate: undefined,
                            endDate: undefined,
        },
        // 表单校验
        formRules: {
                        lineId: [{ required: true, message: '线路ID不能为空', trigger: 'blur' }],
                        cardId: [{ required: true, message: '物理卡号不能为空', trigger: 'blur' }],
                        employeeId: [{ required: true, message: '持卡人ID不能为空', trigger: 'blur' }],
                        employeeCode: [{ required: true, message: '持卡人编号ID不能为空', trigger: 'blur' }],
                        employeeName: [{ required: true, message: '持卡人姓名不能为空', trigger: 'blur' }],
                        idCard: [{ required: true, message: '持卡人身份证号不能为空', trigger: 'blur' }],
                        cardType: [{ required: true, message: '卡类型不能为空', trigger: 'change' }],
                        startDate: [{ required: true, message: '有效时间不能为空', trigger: 'blur' }],
                        endDate: [{ required: true, message: '失效时间不能为空', trigger: 'blur' }],
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
            const res = await CardsApi.getCards(id);
            this.formData = res.data;
            this.title = "修改门禁卡片管理";
          } finally {
            this.formLoading = false;
          }
        }
        this.title = "新增门禁卡片管理";
      },
      /** 开卡 */
      creadCard(form) {

        if (form) {

          this.reset();
          this.title = "开卡";
          this.formData.employeeId= form.id;
          this.formData.employeeCode= form.employee_code;
          this.formData.employeeName = form.username
          this.formData.idCard  =  form.id_card
          this.dialogVisible = true;
        }

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
            await CardsApi.updateCards(data);
            this.$modal.msgSuccess("修改成功");
            this.dialogVisible = false;
            this.$emit('success');
            return;
          }
          // 添加的提交
          await CardsApi.createCards(data);
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
                            cardId: undefined,
                            cardMapBcd: undefined,
                            cardNo: undefined,
                            employeeId: undefined,
                            employeeCode: undefined,
                            employeeName: undefined,
                            idCard: undefined,
                            cardType: undefined,
                            cardState: undefined,
                            startDate: undefined,
                            endDate: undefined,
        };
        this.resetForm("formRef");
      }
    }
  };
</script>
<style lang="scss" scoped>
.input-width {
  width: 100%;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-editor.el-input),
:deep(.el-date-editor--date) {
  width: 100%;
}

.el-form {
  padding: 0 20px;

  .el-form-item {
    width: 100%;
    margin-bottom: 22px;

    :deep(.el-form-item__content) {
      width: calc(100% - 160px); // 160px 是 label 的宽度
    }
  }
}

.el-dialog {
  :deep(.el-dialog__body) {
    padding: 10px 0;
  }
}
</style>
