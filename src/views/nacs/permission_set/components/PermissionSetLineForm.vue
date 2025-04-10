<template>
  <el-dialog :title="dialogTitle" :visible.sync="visible" width="500px" append-to-body>
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="线路ID" prop="lineId">
        <el-input v-model="formData.lineId" placeholder="请输入线路ID" />
      </el-form-item>
      <el-form-item label="门禁权限组编号" prop="logicDeciveCode">
        <el-input v-model="formData.logicDeciveCode" placeholder="请输入门禁权限组编号" />
      </el-form-item>
      <el-form-item label="授权模式" prop="authMode">
        <el-select v-model="formData.authMode" placeholder="请选择授权模式">
          <el-option
            v-for="dict in this.getDictDatas(DICT_TYPE.NACS_AUTH_MODE)"
            :key="parseInt(dict.value)"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "PermissionSetLineForm",
  data() {
    return {
      visible: false,
      dialogTitle: '',
      setId: undefined,
      formData: {
        id: undefined,
        lineId: undefined,
        logicDeciveCode: undefined,
        authMode: undefined,
        remark: undefined
      },
      rules: {
        lineId: [{ required: true, message: "线路ID不能为空", trigger: "blur" }],
        logicDeciveCode: [{ required: true, message: "门禁权限组编号不能为空", trigger: "blur" }],
        authMode: [{ required: true, message: "授权模式不能为空", trigger: "change" }]
      }
    }
  },
  methods: {
    async open(setId, id) {
      this.reset()
      this.setId = setId
      this.visible = true
      if (id) {
        this.dialogTitle = "修改线路"
        // const res = await getPermissionSetLine(setId, id)
        // this.formData = res.data
        // 模拟获取数据
        this.formData = {
          id: id,
          lineId: 'LINE001',
          logicDeciveCode: 'DEVICE001',
          authMode: 1,
          remark: '测试线路'
        }
      } else {
        this.dialogTitle = "新增线路"
      }
    },
    submitForm() {
      this.$refs["form"].validate(async valid => {
        if (!valid) return
        try {
          const data = { ...this.formData, setId: this.setId }
          // if (data.id) {
          //   await updatePermissionSetLine(data)
          // } else {
          //   await createPermissionSetLine(data)
          // }
          // 模拟保存成功
          await new Promise(resolve => setTimeout(resolve, 300))
          this.visible = false
          this.$modal.msgSuccess(data.id ? "修改成功" : "新增成功")
          this.$emit('success')
        } catch (error) {
          this.$modal.msgError("操作失败")
        }
      })
    },
    cancel() {
      this.visible = false
      this.reset()
    },
    reset() {
      this.formData = {
        id: undefined,
        lineId: undefined,
        logicDeciveCode: undefined,
        authMode: undefined,
        remark: undefined
      }
      this.resetForm("form")
    }
  }
}
</script> 