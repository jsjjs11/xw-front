<template>
  <el-drawer :title="dialogTitle" :visible.sync="visible" direction="rtl" size="90%" :modal="true"
    :append-to-body="true" :modal-append-to-body="false" :destroy-on-close="true" @close="reset">
    <!--  <el-dialog :title="dialogTitle" :visible.sync="visible" width="1400px" append-to-body @open="handleAuthDialogOpen" >-->
    <el-form ref="form" label-width="100px">
      <el-form-item label="" prop="authItems" class="auth-items">

        <div class="auth-column">
          <el-col :span="2">
            <!-- 线路列 -->
            <div class="column line-list">
              <div class="section-title">线路列表</div>
              <el-radio-group v-model="selectedLine" @change="onLineChange">
                <el-timeline class="custom-timeline">
                  <el-timeline-item v-for="line in lineList" :key="line.lineNo" size="large">
                    <template #dot>
                      <el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`">
                        {{ line.name }}
                      </el-radio>
                    </template>
                  </el-timeline-item>
                </el-timeline>
              </el-radio-group>
            </div>
          </el-col>
          <!-- 车站列 -->
          <el-col :span="3">
            <div class="column station-list">
              <div class="section-title">车站列表</div>
              <el-checkbox-group v-model="selectedStation" @change="onStationChange">

                <el-checkbox v-for="station in stationList" :key="station.stationNo" :label="station.stationNo" :disabled="authMode === 2">
                  {{ station.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-col>

          <!-- 门禁列 -->
          <el-col :span="10">
            <div class="column line-list">
              <div class="section-title">可选门禁设备-{{tableData.length}}个授权项</div>
              <el-table ref="deviceTable" :data="tableData" border style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column prop="lineNo" label="线路名称">
                  <template v-slot="scope">
                    <span>{{lineList.find(line => line.lineNo === scope.row.lineNo).name}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="设备编号">
                  <template v-slot="scope">
                    <span>{{ scope.row.code }}</span>
                  </template>
                </el-table-column>

                <el-table-column prop="name" label="设备名称">
                  <template v-slot="scope">
                    <span>{{ scope.row.name }}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="stationNo" label="车站编号" v-if="authMode === 1">
                  <template v-slot="scope">
                    <span>{{ stationList.find(station => station.stationNo === scope.row.stationNo).name }}</span>

                  </template>
                </el-table-column> -->
                <el-table-column prop="authMode" label="权限模式">
                  <template v-slot="scope">
                    <dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
                  </template>
                </el-table-column>

              </el-table>
            </div>
          </el-col>
          <el-col :span="9">
            <div class="column line-list">
              <div class="section-title">已选设备列表-{{selectedTableData.length}}个授权项</div>
              <el-table :data="selectedTableData" border style="width: 100%">
                <el-table-column prop="lineNo" label="线路名称">
                  <template v-slot="scope">
                    <span>{{lineList.find(line => line.lineNo === scope.row.lineNo).name}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="code" label="设备编号">
                  <template v-slot="scope">
                    <span>{{ scope.row.code }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="name" label="设备名称">
                  <template v-slot="scope">
                    <span>{{ scope.row.name }}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="stationNo" label="车站编号">
                  <template v-slot="scope">
                    <span v-if="authMode === 1">{{ stationList.find(station => station.stationNo === scope.row.stationNo).name }}</span>
                    <span v-else>{{ scope.row.stationNo }}</span>
                  </template>
                </el-table-column> -->
                <el-table-column prop="authMode" label="权限模式">
                  <template v-slot="scope">
                    <dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
                  </template>
                </el-table-column>
                <el-table-column prop="authMode" label="操作">
                  <!--删除-->
                  <template v-slot="scope">
                    <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                  </template>
                </el-table-column>

              </el-table>
            </div>
          </el-col>
        </div>
      </el-form-item>
      <!-- <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item> -->

    </el-form>
    <div class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </div>
  </el-drawer>
</template>

<script>

import * as PermissionSetApi from '@/api/nacs/permission_set';
import {getLineDatas} from "@/utils/dict";
import * as LineApi from '@/api/nacs/line';
export default {
  name: "PermissionSetDetailForm",
  props:[
    'setCode',"selectedList"
  ],// 集合编号（主表的关联字段）
  data() {
    return {

      selectedStation: [],
      selectedLine: [],
      tableData: [],
      selectedTableData: [],
      lineList: getLineDatas(),
      stationList: [],
      authMode: 1,
      visible: false,
      dialogTitle: '',
      searchStationlist: [],
    }
  },
  methods: {
    handleDelete(row){
      this.selectedTableData = this.selectedTableData.filter(item => item.lineNo !== row.lineNo && item.authMode !== row.authMode && item.code !== row.code)
      this.setSelectedTableData()
    },
    /** 获取车站数据 */
    async onLineChange() {
      if(this.selectedLine){
        let res = await PermissionSetApi.getDevice({lineNo:this.selectedLine});
        //找出与res.data.lineNo相等时lineList中对应的authMode
        this.authMode = this.lineList.find(line => line.lineNo === res.data.lineNo).authMode;
        this.stationList = res.data.stations
        if(this.authMode === 1){//按设备授权
          this.tableData = res.data.devices
        }else{//按组授权
          this.tableData = res.data.groups
        }
        //遍历tableData给里面的每个对象增加lineNo字段
        this.tableData.forEach(item => {
          item.lineNo = res.data.lineNo
        })
        this.baseTableData = this.tableData
        this.setSelectedTableData()
      }
    },
    setSelectedTableData(){
      // 在下一个tick中设置选中状态，确保表格已经渲染完成
      this.$nextTick(() => {
        this.tableData.forEach(item => {
          console.log(this.selectedTableData)
          if (this.selectedTableData.some(selectedItem =>
            selectedItem.lineNo === item.lineNo &&
            selectedItem.authMode === item.authMode &&
            selectedItem.code === item.code
          )) {
            this.$refs.deviceTable.toggleRowSelection(item, true);
          }else{
            this.$refs.deviceTable.toggleRowSelection(item, false);
          }
        });
      });
    },
    /** 获取门禁数据 */
    onStationChange() {
      // 根据selectedStation中的stationNo过滤tableData,不改变tableData的内容，只改变tableData的显示
      if(this.selectedStation.length === 0){
        this.tableData = this.baseTableData
      }else{
        this.tableData = this.baseTableData.filter(item => this.selectedStation.includes(item.stationNo));
      }
      this.setSelectedTableData()
    },




    async open(id) {
      this.reset()
      this.visible = true
      if(this.lineList.length>1){
        this.selectedLine = this.lineList[0].lineNo
      }
      let res = await PermissionSetApi.getPermissionSetDetailList(this.setCode)
      this.selectedTableData = res.data
      this.onLineChange(); // 默认载入第一条线路的站点

      if (id) {
        this.dialogTitle = "修改权限集详情"
      } else {
        this.dialogTitle = "新增权限集详情"
      }
    },


    cancel() {
      this.visible = false
      this.reset()

    },
    reset() {
      //初始化tableData
      this.tableData = []
      this.selectedTableData = []
      this.resetForm("form")
    },
    handleSelectionChange(selection,state) {
      //将选中项增加到selectedTableData中且排除已选中的项
      this.selectedTableData = [...this.selectedTableData, ...selection.filter(item => !this.selectedTableData.some(selectedItem => selectedItem.lineNo === item.lineNo && selectedItem.authMode === item.authMode && selectedItem.code === item.code))]
      //selection为空时this.selectedTableData
    },
    /** 确认提交 */
    async handleConfirm() {
      try {
        const submitData = {
          setCode: this.setCode,
          list: this.selectedTableData
        }
        await PermissionSetApi.createPermissionSetDetail(submitData)
        this.$modal.msgSuccess("保存成功")
        this.visible = false
        this.$emit('success')
      } catch (error) {
        this.$modal.msgError("保存失败")
      }
    },
  }
}
</script>

<style scoped lang="scss">
:deep(.auth-items) {
  /* 改为块级布局 */
  display: block !important;
/* 标签容器样式 */
.el-form-item__label {
  display: block;
  text-align: left !important;
  padding-bottom: 16px;  /* 增加标签与内容间距 */
  line-height: 1.5;
  margin-left: 30px !important;
}

/* 内容区域样式 */
.el-form-item__content {
  display: block;
  margin-left: 30px !important;

}
}

/* 三列布局 */
.auth-columns {
  display: flex;
  gap: 20px;
  margin-top: 15px;

}

/* 列公共样式 */
.column {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

/* 滚动条设置 */
.line-list,
.station-list {
  height: calc(100vh - 300px);
  overflow-y: auto;
}

/* 时间线样式优化 */
:deep(.custom-timeline) {
  padding-left: 10px;
.el-timeline-item__node {
  background: transparent;
}
}

/* 单选按钮样式 */
.el-radio {
  display: block;
  margin: 8px 0;
}
:deep(.station-list) .el-checkbox {
  margin-bottom: 0px;
  display: block;
}
::v-deep .el-timeline-item__tail {
  left: 6px;
  margin-top: 18px;
}
::v-deep .el-timeline-item__timestamp.is-top {
  margin-bottom: 3px;
}
::v-deep(.custom-timeline-station)  .el-timeline-item {
  padding-bottom: 10px;
}
::v-deep .el-timeline-item {
  padding-bottom: 18px;
}
.dialog-footer {
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  text-align: right;
  border-top: 1px solid #e8e8e8;
}
::v-deep .el-transfer {
  margin-left: 7px;
}
::v-deep .el-transfer-panel{
  width: 370px; /* 左右两个穿梭框的高度和宽度 */
  height: calc(100vh - 360px);
}
::v-deep .el-transfer-panel__list.is-filterable {
  height: calc(100vh - 400px);
}
</style>

