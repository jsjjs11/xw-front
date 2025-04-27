<template>
  <div class="app-container">
    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="45%" v-dialogDrag append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="formLoading" label-width="100px">
        <el-form-item label="线路编号" prop="lineNo">
          <el-input v-model="formData.lineNo" placeholder="请输入线路编号" />
        </el-form-item>
        <el-form-item label="线路名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入线路名称" />
        </el-form-item>
        <el-form-item label="线路颜色" prop="color">
          <el-input v-model="formData.color" placeholder="请输入线路颜色" />
        </el-form-item>
        <el-form-item label="负责人用户ID" prop="leaderUserId">
          <el-input v-model="formData.leaderUserId" placeholder="请输入负责人用户ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入备注" />
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
import * as LinesApi from '@/api/nacs/line';
export default {
  name: "LinesForm",
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
        lineNo: undefined,
        name: undefined,
        color: undefined,
        leaderUserId: undefined,
        remark: undefined,
      },
      // 表单校验
      formRules: {
        lineNo: [{ required: true, message: '线路编号不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '线路名称不能为空', trigger: 'blur' }],
        color: [{ required: true, message: '线路颜色不能为空', trigger: 'blur' }],
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
          const res = await LinesApi.getLines(id);
          this.formData = res.data;
          this.title = "修改线路信息";
        } finally {
          this.formLoading = false;
        }
      }
      this.title = "新增线路信息";
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
          await LinesApi.updateLines(data);
          this.$modal.msgSuccess("修改成功");
          this.dialogVisible = false;
          this.$emit('success');
          return;
        }
        // 添加的提交
        await LinesApi.createLines(data);
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
        lineNo: undefined,
        name: undefined,
        color: undefined,
        leaderUserId: undefined,
        remark: undefined,
      };
      this.resetForm("formRef");
    }
  }
};
</script>
