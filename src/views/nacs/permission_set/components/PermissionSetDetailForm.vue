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

                <el-checkbox v-for="station in stationList" :key="station.stationNo" :label="station.stationNo"
                  :disabled="authMode === 2">
                  {{ station.name }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-col>

          <!-- 门禁列 -->
          <el-col :span="10">
            <div class="column line-list">
              <div class="section-title">可选门禁设备-{{tableData.length}}个授权项</div>
              <el-table ref="deviceTable" :data="tableData" border style="width: 100%" height="calc(100% - 50px)"
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
                    <el-link type="primary" v-if="scope.row.id.indexOf('GROUP') != -1" :underline="false"
                      @click="showGroupDetails(scope.row)" style="text-decoration: underline;">
                      {{ scope.row.name }}
                      <i class="el-icon-view el-icon--right"></i>
                    </el-link>
                    <span v-else>{{ scope.row.name }}</span>
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
              <el-table :data="selectedTableData" border style="width: 100%" height="calc(100% - 50px)">
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
                    <el-link type="primary" v-if="scope.row.id.indexOf('GROUP') != -1" :underline="false"
                      @click="showGroupDetails(scope.row)" style="text-decoration: underline;">
                      {{ scope.row.name }}
                      <i class="el-icon-view el-icon--right"></i>
                    </el-link>
                    <span v-else>{{ scope.row.name }}</span>
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
    <group-detail-drawer ref="groupDetailDrawerRef" />
  </el-drawer>

</template>

<script>
import groupDetailDrawer from '../../../../components/nacs/groupDetailDrawer.vue'
import * as PermissionSetApi from '@/api/nacs/permission_set';
import {getLineDatas} from "@/utils/dict";
import * as LineApi from '@/api/nacs/line';
export default {
  name: "PermissionSetDetailForm",
  components: { groupDetailDrawer },
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
      isProgrammaticSelection: false,
    }
  },
  methods: {
    showGroupDetails(row) {
      this.$refs["groupDetailDrawerRef"].showGroupDetails(row)
    },
    handleDelete(row){
      // 判断删除的是否是当前线路的项
      const isCurrentLine = row.lineNo === this.selectedLine;

      // 更新selectedTableData，只删除完全匹配的行
      this.selectedTableData = this.selectedTableData.filter(item =>
        !(item.lineNo === row.lineNo &&
          item.authMode === row.authMode &&
          item.code === row.code)
      );

      // 只有删除当前线路的项时才更新表格选中状态
      if (isCurrentLine) {

        this.isProgrammaticSelection = true; // 设置标志位
        this.setSelectedTableData();
        this.isProgrammaticSelection = false;
      }
    },
    /** 获取车站数据 */
    async onLineChange() {
      if(this.selectedLine){
        this.isProgrammaticSelection = true; // 设置标志位
        let res = await PermissionSetApi.getDevice({lineNo:this.selectedLine});
        //找出与res.data.lineNo相等时lineList中对应的authMode
        this.authMode = this.lineList.find(line => line.lineNo === res.data.lineNo).authMode;
        this.stationList = res.data.stations
        this.tableData = [...res.data.devices,...res.data.groups]
        //遍历tableData给里面的每个对象增加lineNo字段
        this.tableData.forEach(item => {
          item.lineNo = res.data.lineNo
        })
        this.baseTableData = this.tableData

        // 等待下一个渲染周期，确保表格已经渲染完成
        await this.$nextTick()
        this.setSelectedTableData()
        // 使用setTimeout确保所有操作完成后再重置标志位
        setTimeout(() => {
          this.isProgrammaticSelection = false;
        }, 0);
      }
    },
    setSelectedTableData(){
      // 确保表格引用存在
      if (!this.$refs.deviceTable) {
        return;
      }
      this.$refs.deviceTable.$off('selection-change');
      // 在下一个tick中设置选中状态，确保表格已经渲染完成
      this.$nextTick(() => {
        // 先清除所有选中状态
        this.$refs.deviceTable.clearSelection();

        // 设置新的选中状态
        this.tableData.forEach(item => {
          if (this.selectedTableData.some(selectedItem =>
            selectedItem.lineNo === item.lineNo &&
            selectedItem.authMode === item.authMode &&
            selectedItem.code === item.code
          )) {
            this.$refs.deviceTable.toggleRowSelection(item, true);
          }
        });
      });
      // 重新添加事件监听
      this.$nextTick(() => {
        this.$refs.deviceTable.$on('selection-change', this.handleSelectionChange);
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
      this.selectedStation = [];
      this.resetForm("form")
    },
    handleSelectionChange(selection) {
      // 如果是程序触发的选择变化，则不处理
      if (this.isProgrammaticSelection) {
        return;
      }

      // 获取当前选中项的lineNo
      const currentLineNo = this.selectedLine;

      // 将selectedTableData分为当前线路的项和其他线路的项
      const currentLineItems = this.selectedTableData.filter(item => item.lineNo === currentLineNo);
      const otherLineItems = this.selectedTableData.filter(item => item.lineNo !== currentLineNo);

      // 找出新增的项（在selection中但不在currentLineItems中）
      const addedItems = selection.filter(item =>
        !currentLineItems.some(existingItem =>
          existingItem.lineNo === item.lineNo &&
          existingItem.authMode === item.authMode &&
          existingItem.code === item.code
        )
      );

      // 找出删除的项（在currentLineItems中但不在selection中）
      const removedItems = currentLineItems.filter(item =>
        !selection.some(selectedItem =>
          selectedItem.lineNo === item.lineNo &&
          selectedItem.authMode === item.authMode &&
          selectedItem.code === item.code
        )
      );

      // 更新当前线路的选中项：移除删除的项，添加新增的项
      const updatedCurrentLineItems = [
        ...currentLineItems.filter(item =>
          !removedItems.some(removedItem =>
            removedItem.lineNo === item.lineNo &&
            removedItem.authMode === item.authMode &&
            removedItem.code === item.code
          )
        ),
        ...addedItems
      ];

      // 合并更新后的当前线路项和其他线路项
      this.selectedTableData = [...otherLineItems, ...updatedCurrentLineItems];
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

.section-title {
  height: 50px;
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
  height: calc(100vh - 200px);
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
</style>

