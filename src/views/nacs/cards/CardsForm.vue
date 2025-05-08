<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="160px">
        <el-row>
<!--          <el-col :span="24">-->
<!--            <el-form-item label="线路ID" prop="lineId">-->
<!--              <el-input v-model="formData.lineId" placeholder="请输入线路ID" class="input-width" />-->
<!--            </el-form-item>-->
<!--          </el-col>-->
          <!-- <el-col :span="24">
            <el-form-item label="物理卡号" prop="cardId">
              <el-input v-model="formData.cardId" placeholder="请输入物理卡号" class="input-width" />
            </el-form-item>
          </el-col> -->
<!--          <el-col :span="24">-->
<!--            <el-form-item label="虚拟卡号" prop="cardMapBcd">-->
<!--              <el-input v-model="formData.cardMapBcd" placeholder="请输入虚拟卡号" class="input-width" />-->
<!--            </el-form-item>-->
<!--          </el-col>-->
         <el-col :span="24">
           <el-form-item label="卡号" prop="cardNo">
             <el-input v-model="formData.cardNo" placeholder="请输入卡号" class="input-width" />
           </el-form-item>
         </el-col>
          <!-- <el-col :span="24">
            <el-form-item label="持卡人ID" prop="employeeId">
              <el-input v-model="formData.employeeId" placeholder="请输入持卡人ID" class="input-width" />
            </el-form-item>
          </el-col> -->
          <el-col :span="24">
            <el-form-item label="持卡人编号ID" prop="employeeCode">
              <el-input v-model="formData.employeeCode" placeholder="请输入持卡人编号ID" class="input-width" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
            <el-form-item label="持卡人姓名" prop="employeeName">
              <el-input v-model="formData.employeeName" placeholder="请输入持卡人姓名" class="input-width" />
            </el-form-item>
          </el-col> -->
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
<!--          <el-col :span="24">-->
<!--            <el-form-item label="卡状态" prop="cardState">-->
<!--              <el-select v-model="formData.cardState" placeholder="请选择卡状态" class="input-width">-->
<!--                <el-option v-for="dict in this.getDictDatas(DICT_TYPE.NACS_CARD_STATE)" :key="dict.value"-->
<!--                  :label="dict.label" :value="parseInt(dict.value)" />-->
<!--              </el-select>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
          <el-col :span="24">
            <el-form-item label="有效时间" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="datetime"
                placeholder="选择有效时间"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="失效时间" prop="endDate">
              <el-date-picker
                v-model="formData.endDate"
                type="datetime"
                placeholder="选择失效时间"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 快捷按钮组 -->
        <el-form-item label="快捷选择">
          <div class="quick-select-buttons">
            <el-button size="small" type="primary" plain @click="handleQuickSelect(1)">1个月</el-button>
            <el-button size="small" type="primary" plain @click="handleQuickSelect(12)">1年</el-button>
            <el-button size="small" type="primary" plain @click="handleQuickSelect(120)">10年</el-button>
            <el-button size="small" type="primary" plain @click="handleQuickSelect(360)">30年</el-button>
          </div>
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
import { parseTime} from "@/utils/ruoyi";
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
                            // cardId: undefined,
                            // cardMapBcd: undefined,
                            cardNo: undefined,
                            // employeeId: undefined,
                            employeeCode: undefined,
                            // employeeName: undefined,
                            idCard: undefined,
                            cardType: undefined,
                            cardState: undefined,
                            startDate: undefined,
                            endDate: undefined,
        },
        // 表单校验
        formRules: {
                        lineId: [{ required: true, message: '线路ID不能为空', trigger: 'blur' }],
                        cardNo: [{ required: true, message: '卡号不能为空', trigger: 'blur' }],
                        // employeeId: [{ required: true, message: '持卡人ID不能为空', trigger: 'blur' }],
                        employeeCode: [{ required: true, message: '持卡人编号ID不能为空', trigger: 'blur' }],
                        // employeeName: [{ required: true, message: '持卡人姓名不能为空', trigger: 'blur' }],
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
            this.formData.startDate = this.parseTime(res.data.startDate);
            this.formData.endDate = this.parseTime(res.data.endDate);

            this.title = "修改门禁卡片管理";
          } finally {
            this.formLoading = false;
          }
        } else {
          this.title = "新增门禁卡片管理";
          // 设置默认的开始时间和结束时间
          this.handleQuickSelect(12); // 默认设置为1年
        }
      },
      /** 从人员页面开卡 */
      creadCard(form) {
        if (form) {
          this.reset();
          this.title = "开卡";
          // this.formData.employeeId = form.id;
          this.formData.employeeCode = form.employeeCode;
          // this.formData.employeeName = form.username;
          this.formData.idCard = form.idCard;
          // 设置默认的开始时间和结束时间
          this.handleQuickSelect(12); // 默认设置为1年
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
                            // cardId: undefined,
                            // cardMapBcd: undefined,
                            cardNo: undefined,
                            // employeeId: undefined,
                            employeeCode: undefined,
                            // employeeName: undefined,
                            idCard: undefined,
                            cardType: undefined,
                            cardState: undefined,
                            startDate: undefined,
                            endDate: undefined,
        };
        this.resetForm("formRef");
      },
      // 处理快捷选择
      handleQuickSelect(months) {
        const now = new Date()
        this.formData.startDate = this.parseTime(now, '{y}-{m}-{d} {h}:{i}:{s}')

        // 计算结束时间
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + months)
        this.formData.endDate = this.parseTime(endDate, '{y}-{m}-{d} {h}:{i}:{s}')
      },

      // 时间格式化方法
      parseTime(time, pattern) {
        if (arguments.length === 0 || !time) {
          return null
        }
        const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
        let date
        if (typeof time === 'object') {
          date = time
        } else {
          if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
          } else if (typeof time === 'string') {
            time = time.replace(new RegExp(/-/gm), '/')
          }
          if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
          }
          date = new Date(time)
        }
        const formatObj = {
          y: date.getFullYear(),
          m: date.getMonth() + 1,
          d: date.getDate(),
          h: date.getHours(),
          i: date.getMinutes(),
          s: date.getSeconds(),
          a: date.getDay()
        }
        const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
          let value = formatObj[key]
          // Note: getDay() returns 0 on Sunday
          if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
          if (result.length > 0 && value < 10) {
            value = '0' + value
          }
          return value || 0
        })
        return time_str
      },

      /** 处理卡片挂失 */
      async handleLostCard(row) {
        if (row.cardState !== 0) {
          this.$modal.msgError("卡片未激活，无法执行挂失操作");
          return;
        }
        try {
          await this.$modal.confirm('确认要挂失该卡片吗？');
          this.loading = true;
          // 修改卡片状态为挂失(假设状态码 1 为挂失)
          const data = { ...row, cardState: 1 };
          await CardsApi.updateCards(data);
          this.$modal.msgSuccess("卡片已挂失");
          this.getList(); // 刷新列表
        } catch (error) {
          console.error("挂失操作失败", error);
          this.$modal.msgError("挂失操作失败");
        } finally {
          this.loading = false;
        }
      },

      /** 处理加入黑名单 */
      async handleBlacklist(row) {
        if (row.cardState !== 0) {
          this.$modal.msgError("卡片未激活，无法加入黑名单");
          return;
        }
        try {
          await this.$modal.confirm('确认要将该卡片加入黑名单吗？');
          this.loading = true;
          // 修改卡片状态为黑名单(假设状态码 2 为黑名单)
          const data = { ...row, cardState: 2 };
          await CardsApi.updateCards(data);
          this.$modal.msgSuccess("卡片已加入黑名单");
          this.getList(); // 刷新列表
        } catch (error) {
          console.error("加入黑名单操作失败", error);
          this.$modal.msgError("加入黑名单操作失败");
        } finally {
          this.loading = false;
        }
      },

      /** 处理恢复正常 */
      async handleRestore(row) {
        try {
          await this.$modal.confirm('确认要将该卡片恢复正常状态吗？');
          this.loading = true;
          // 修改卡片状态为正常(假设状态码 0 为正常)
          const data = { ...row, cardState: 0 };
          await CardsApi.updateCards(data);
          this.$modal.msgSuccess("卡片已恢复正常");
          this.getList(); // 刷新列表
        } catch (error) {
          console.error("恢复操作失败", error);
          this.$modal.msgError("恢复操作失败");
        } finally {
          this.loading = false;
        }
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

.quick-select-buttons {
  display: flex;
  gap: 10px; // 按钮之间的间距
  flex-wrap: wrap; // 如果空间不够会换行

  .el-button {
    flex: 1; // 按钮平均分配空间
    min-width: 80px; // 设置最小宽度
    margin: 0; // 移除默认的margin
  }
}

// 移除之前的按钮组样式
.el-button-group {
  margin-bottom: 10px;
}
.el-button-group .el-button {
  margin-right: 10px;
}

.el-button + .el-button {
  margin-left: 5px;
}

.el-button[disabled] {
  cursor: not-allowed;
  &:hover {
    pointer-events: none;
  }
}
</style>
