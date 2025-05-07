<template>
  <el-dialog :title="dialogTitle" :visible.sync="visible" width="1200px" append-to-body @open="handleAuthDialogOpen" >
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="授权模式" prop="authMode">
        <el-select v-model="formData.authMode" placeholder="请选择授权模式" @change="handleAuthModeChange" >
          <el-option
            v-for="dict in this.getDictDatas(DICT_TYPE.NACS_AUTH_MODE)"
            :key="parseInt(dict.value)"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="线路" prop="lineNo">
        <el-select v-model="formData.lineNo" placeholder="请选择线路" @change="handleLineChange" >
          <el-option
            v-for="line in lineMap"
            :key="parseInt(line.id)"
            :label="line.name"
            :value="line.lineNo"
          />
        </el-select>
      </el-form-item>
      <!-- 门禁组穿梭框 - 按组授权模式 -->
      <el-form-item label="门禁组" prop="groupIds" v-if="formData.authMode === 0">
        <el-transfer
          v-model="formData.groupIds"
          :data="groupOptions"
          :titles="['可选门禁组', '已选门禁组']"
          :props="{
            key: 'id',
            label: 'groupName'
          }"
          filterable
          filter-placeholder="请输入门禁组名称"
          class="custom-transfer"
        />
      </el-form-item>

      <!-- 门禁点穿梭框 - 按点授权模式 -->
      <el-form-item label="门禁点" prop="deviceIds" v-if="formData.authMode === 1">
        <el-transfer
          v-model="formData.deviceIds"
          :data="deviceOptions"
          :titles="['可选门禁点', '已选门禁点']"
          :props="{
            key: 'id',
            label: 'deviceName'
          }"
          filterable
          filter-placeholder="请输入门禁点名称"
          class="custom-transfer"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注"  />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {getLineDatas} from "@/utils/dict";
import * as  groupsApi from "@/api/nacs/d_groups/index";
export default {
  name: "PermissionSetDetailForm",
  props:[
    'setCode',"selectedList"
  ],// 集合编号（主表的关联字段）
  data() {
    return {
      lineMap: getLineDatas(),
      visible: false,
      dialogTitle: '',
      // 门禁组选项
      groupOptions: [],
      // 门禁点选项
      deviceOptions: [],
      formData: {
        authMode: 0,
        groupIds: [], // 选中的门禁组ID数组
        deviceIds: [], // 选中的门禁点ID数组
        remark: undefined
      },
      rules: {
        authMode: [{ required: true, message: "授权模式不能为空", trigger: "change" }],
        groupIds: [{ required: true, message: "请选择门禁组", trigger: "change" }],
        deviceIds: [{ required: true, message: "请选择门禁点", trigger: "change" }]
      }
    }
  },
  methods: {
    // 添加对话框打开事件处理
    handleAuthDialogOpen() {
      if (!this.formData.authType ) {
        this.$set(this.formData, 'authMode', 0);
        this.loadGroupOptions()
      }
    },
    /** 线路变更 *///TODO待完成根据线路编号去查询门禁点或门禁组
    handleLineChange(value){
      this.loadOptions()
    },
    loadOptions(){

    },
    /** 处理授权模式变更 */
    handleAuthModeChange(value) {
      // 根据授权模式加载不同的数据
      if (value === 0) {
        this.loadGroupOptions()
      } else if (value === 1) {
        this.loadDeviceOptions()
      }
    },

    /** 加载门禁组数据 */
    async loadGroupOptions() {
      try {
        //const res = await getDGroupList()
        let res = {data:[
            {
              "id": 1,
              "lineId": "7",
              "group_code": "101",
              "group_name": "主楼大厅门禁"
            },
            {
              "id": 2,
              "lineId": "7",
              "group_code": "102",
              "group_name": "主楼电梯门禁"
            },
            {
              "id": 3,
              "lineId": "7",
              "group_code": "201",
              "group_name": "东区侧门门禁"
            },
            {
              "id": 4,
              "lineId": "7",
              "group_code": "202",
              "group_name": "东区停车场门禁"
            },
            {
              "id": 5,
              "lineId": "7",
              "group_code": "301",
              "group_name": "西区实验室门禁"
            },
            {
              "id": 6,
              "lineId": "7",
              "group_code": "302",
              "group_name": "西区仓库门禁"
            },
            {
              "id": 7,
              "lineId": "7",
              "group_code": "401",
              "group_name": "南区员工通道"
            },
            {
              "id": 8,
              "lineId": "7",
              "group_code": "402",
              "group_name": "南区消防通道"
            },
            {
              "id": 9,
              "lineId": "7",
              "group_code": "501",
              "group_name": "北区VIP通道"
            },
          ]}
        this.groupOptions = res.data.map(item => ({
          id: item.id,
          groupName: item.group_name,
          groupCode: item.group_code,
          lineId:item.lineId
        }))
      } catch (error) {
        console.error('加载门禁组失败:', error)
        this.$modal.msgError('加载门禁组失败')
      }
    },

    /** 加载门禁点数据 */
    async loadDeviceOptions() {
      try {
        // 模拟门禁点数据
        let res = {data:[
          {
            "id": 11,
            "lineId": "6",
            "device_code": "D101",
            "device_name": "主楼大厅1号门",
            "group_id": 1
          },
          {
            "id": 22,
            "lineId": "6",
            "device_code": "D102",
            "device_name": "主楼大厅2号门",
            "group_id": 2
          },
          {
            "id": 33,
            "lineId": "6",
            "device_code": "D201",
            "device_name": "主楼电梯1号门",
            "group_id": 3
          },
          {
            "id": 44,
            "lineId": "6",
            "device_code": "D202",
            "device_name": "主楼电梯2号门",
            "group_id": 4
          }
        ]}
        this.deviceOptions = res.data.map(item => ({
          id: item.id,
          deviceName: item.device_name,
          deviceCode: item.device_code,
          groupId: item.group_id,
          lineId:item.lineId
        }))
      } catch (error) {
        console.error('加载门禁点失败:', error)
        this.$modal.msgError('加载门禁点失败')
      }
    },

    async open(id) {
      this.reset()
      this.visible = true

      if (id) {
        this.dialogTitle = "修改权限集详情"
        // 根据列表数据设置默认值
        const row = {
          id: 1,
          authMode: 0, // 默认按组授权
          remark: '测试数据1'
        }

        this.formData = {
          ...row,
          groupIds: [], // 根据实际数据设置
          deviceIds: [] // 根据实际数据设置
        }

        // 根据授权模式加载对应数据
        this.handleAuthModeChange(row.authMode)
      } else {
        this.dialogTitle = "新增权限集详情"
      }
    },

    submitForm() {

      console.log(getLineDatas())
      this.$refs["form"].validate(async valid => {
        if (!valid) return
        try {
          let submitData = []
          let groupIdsData = []
          let deviceIdsData = []
          // 处理按组授权的数据
          if (this.formData.groupIds.length > 0) {
            // 找到选中的门禁组对应的数据
            groupIdsData = this.formData.groupIds.map(groupId => {
              const groupInfo = this.groupOptions.find(item => item.id === groupId)
              return {
                lineId: groupInfo.lineId,
                logicDeciveCode: groupInfo.groupCode, // 使用门禁组的编号
                authMode: 0,
                setCode: this.setCode,
                remark: this.formData.remark
              }
            })
          }
          // 处理按点授权的数据
          if ( this.formData.deviceIds.length > 0) {
            // 找到选中的门禁点对应的数据
            deviceIdsData = this.formData.deviceIds.map(deviceId => {
              const deviceInfo = this.deviceOptions.find(item => item.id === deviceId)
              return {
                lineId: deviceInfo.lineId,
                logicDeciveCode: deviceInfo.deviceCode,
                authMode: 1,
                setCode: this.setCode,
                remark: this.formData.remark
              }
            })
          }
          submitData = [...groupIdsData, ...deviceIdsData]
          console.log('提交的数据数组：', submitData)
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
        authMode: undefined,
        groupIds: [],
        deviceIds: [],
        remark: undefined
      }
      this.resetForm("form")
    }
  }
}
</script>

<style scoped>
.custom-transfer {
  width: 100%;
  height: 500px;
}
.custom-transfer ::v-deep .el-transfer-panel {
  width: 40%;
  height: 500px;
}


.custom-transfer ::v-deep .el-transfer-panel__list.is-filterable{
    height: 490px;
  }
</style>

