<template>
  <el-dialog :title="dialogTitle" :visible.sync="visible" width="500px" append-to-body>
    <el-form ref="form" :model="formData" :rules="rules" label-width="100px">
      <el-form-item v-if="formData.id" label="权限集标识" prop="setCode">
        <el-input v-model="formData.setCode" disabled />
      </el-form-item>
      <el-form-item label="权限集名称" prop="setName">
        <el-input v-model="formData.setName" placeholder="请输入权限集名称" />
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
import { getPermissionSet, createPermissionSet, updatePermissionSet } from '@/api/nacs/permission_set/index.js'

export default {
  name: "PermissionSetForm",
  data() {
    return {
      visible: false,
      dialogTitle: '',
      formData: {
        id: undefined,
        setCode: undefined,
        setName: undefined,
        remark: undefined
      },
      rules: {
        setName: [{ required: true, message: "权限集名称不能为空", trigger: "blur" }]
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    async open(id) {
      this.reset()
      this.visible = true
      if (id) {
        this.dialogTitle = "修改权限集"
        const res = await getPermissionSet(id)
        this.formData = res.data
      } else {
        this.dialogTitle = "新增权限集"
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(async valid => {
        if (!valid) return
        try {
          const data = { ...this.formData }
          if (data.id) {
            await updatePermissionSet(data)
            this.$modal.msgSuccess("修改成功")
          } else {
            await createPermissionSet(data)
            this.$modal.msgSuccess("新增成功")
          }
          this.visible = false
          this.$emit('success')
        } catch (error) {
          this.$modal.msgError("操作失败")
        }
      })
    },
    /** 取消按钮 */
    cancel() {
      this.visible = false
      this.reset()
    },
    /** 重置表单 */
    reset() {
      this.formData = {
        id: undefined,
        setCode: undefined,
        setName: undefined,
        remark: undefined
      }
      this.resetForm("form")
    }
  }
}
</script>
