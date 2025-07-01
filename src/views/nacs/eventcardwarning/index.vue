<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="告警时间" prop="eventTime">
        <el-date-picker v-model="queryParams.eventTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item label="确认" prop="status">
        <el-select v-model="queryParams.isAck" placeholder="是否确认" clearable >
          <el-option v-for="dict in ackStatusDictDatas" :key="parseInt(dict.value)" :label="dict.label"
                     :value="parseInt(dict.value)" />
        </el-select>
      </el-form-item>
      <el-form-item label="线路编码" prop="lineNo">
        <el-input v-model="queryParams.lineNo" placeholder="请输入线路号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="员工身份证" label-width="85px" prop="idCard">
        <el-input v-model="queryParams.idCard" placeholder="请输入员工身份证号" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="员工姓名" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工姓名" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="卡号信息" prop="cardNo">
        <el-input v-model="queryParams.cardNo" placeholder="请输入卡号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备编号" prop="deviceCode">
        <el-input v-model="queryParams.deviceCode" placeholder="请输入设备编号" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>

      <el-form-item label="告警类型" prop="eventId">
        <el-input v-model="queryParams.eventId" placeholder="请输入告警事件类型" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="告警名称" prop="eventName">
        <el-input v-model="queryParams.eventName" placeholder="请输入告警事件名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="告警详情" prop="remark">
        <el-input v-model="queryParams.remark" placeholder="请输入告警事件详情" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-check" size="mini" @click="ackCurrentPage"
                   v-hasPermi="['nacs:event-card-warning:create']">确认当前页告警
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                   :loading="exportLoading"
                   v-hasPermi="['nacs:event-card-warning:export']">后端导出
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <vxe-button status="primary" size="mini"
                    :icon="globalBlinking ? 'el-icon-video-pause' : 'el-icon-video-play'"
                    @click="toggleGlobalBlinking">
          {{ globalBlinking ? '停止闪烁' : '启动闪烁' }}
        </vxe-button>
      </el-col>
      <el-col :span="2.5">
        <div class="inline-center-div">闪烁速度: </div>
        <el-select
          size="mini"
          v-model="blinkSpeed"
          placeholder="闪烁速度"
          style="width: 120px; margin-left: 10px;"
        >
          <el-option label="慢速" value="2s"></el-option>
          <el-option label="中速" value="1s"></el-option>
          <el-option label="快速" value="0.5s"></el-option>
        </el-select>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <div class="vg-content">
      <vxe-grid ref="gridRef"
                :height="gridOptions.height"
                v-bind="gridOptions.columnConfig"
                :columns="gridOptions.columns"
                :data="gridOptions.data"
                :row-class-name="rowClassName"
      >
        <template #isAckTag="{row}">
          <vxe-tag status="error" v-if="row.isAck == 0">未确认</vxe-tag>
          <vxe-tag status="success" v-if="row.isAck == 1">已确认</vxe-tag>
        </template>
        <template #ackAction="{row}">
          <vxe-tooltip content="单条确认">
            <vxe-button circle
                        plain
                        :disabled="row.isAck == 1"
                        :status="row.isAck == 1 ? 'success' : 'error'"
                        icon="vxe-icon-check"
                        @click="ackBtnClick(row)"
            ></vxe-button>
          </vxe-tooltip>
        </template>
      </vxe-grid>
    </div>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import * as EventCardWarningApi from '@/api/nacs/eventcardwarning';
import {DICT_TYPE, getDictDatas} from "@/utils/dict";
import { formatTimestamp } from "@/utils/dateUtils";
import { mapGetters } from 'vuex'
export default {
  name: "EventCardWarning",
  components: {
  },
  data() {
    const nameFilterRender = {
      name: 'VxeInput'
    }
    const gridOptions = {
      height: "auto",
      // border: true,
      columnConfig: {
        resizable: true
      },
      showFooter: true,
      showOverflow: true,
      columns: [
        { type: 'seq', width: 48 ,fixed: 'left',headerAlign: 'center'},
        { field: 'eventTime', title: '告警时间', width: 160,rowGroupNode: true, sortable: true,fixed: 'left',headerAlign: 'center' ,align: 'center'},
        { field: 'isAck', title: '确认', width: 100,slots:{default:'isAckTag'},headerAlign: 'center',align: 'center'},
        { field: 'eventCode', title: '类型',width: 120, filters: [
            { label: '告警类型1', value: 'E001' },
            { label: '告警类型2', value: 'E002' },
            { label: '告警类型3', value: 'E003' },
            { label: '告警类型4', value: 'E004' },
            { label: '告警类型5', value: 'E005' },
            { label: '告警类型6', value: 'E006' }
          ],headerAlign: 'center',align: 'center'},
        { field: 'eventName', title: '名称',width: 120 ,headerAlign: 'center' ,align: 'center'},
        { field: 'lineNo', title: '线路号',width: 100 ,headerAlign: 'center' ,align: 'center'},
        { field: 'idCard', title: '身份证' ,width: 100 ,headerAlign: 'center' ,align: 'center'},
        { field: 'cardNo', title: '门禁卡号',width: 160 ,headerAlign: 'center' ,align: 'center'},
        { field: 'employeeName', title: '持卡人',minWidth: 100 ,headerAlign: 'center' ,align: 'center'},
        { field: 'deptName', title: '所属部门' ,minWidth: 100 ,headerAlign: 'center' ,align: 'center'},
        { field: 'deviceCode', title: '设备编号' ,minWidth: 80 ,headerAlign: 'center' ,align: 'center'},
        { field: 'deviceName', title: '设备名称' ,minWidth: 120 ,headerAlign: 'center' ,align: 'center'},
        { field: 'ackUser', title: '确认人员',width: 80 ,headerAlign: 'center' ,align: 'center'},
        { field: 'ackTime', title: '确认时间',width: 160 ,headerAlign: 'center'/*, sortable: true*/ ,align: 'center'},
        { field: 'remark', title: '告警详情描述',fixed: 'right',width: 300,filters: [{ data: '' }], filterRender: nameFilterRender ,headerAlign: 'center' ,align: 'center'},
        { title: '确认操作', width: 80, fixed: 'right', slots: { default: 'ackAction' } ,headerAlign: 'center' ,align: 'center'},
      ],
      data: []
    }
    return {
      gridOptions,
      nameFilterRender,
      globalBlinking: true, // 控制闪烁状态
      blinkSpeed: '2s',
      loading: true,        // 遮罩层
      exportLoading: false, // 导出遮罩层
      showSearch: true,     // 显示搜索条件
      total: 0,             // 总条数
      queryParams: {        // 查询参数
        pageNo: 1,
        pageSize: 20,
        lineNo: null,
        employeeCode: null,
        employeeName: null,
        cardNo: null,
        deviceCode: null,
        deviceName: null,
        idCard: null,
        eventTime: [],
        eventId: null,
        eventName: null,
        remark: null,
        createTime: [],
        ackTime: [],
        isAck: null,
        ackUser: null,
        bkField1: null,
      },
      ackStatusDictDatas: getDictDatas(DICT_TYPE.NACS_ALARM_EVENT_ACK),
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.updateBlinkStyles();
  },
  computed: {
    ...mapGetters({
      ackUserName: 'name',
    }),
  },
  watch: {
    blinkSpeed() {
      this.updateBlinkStyles();
    }
  },
  methods: {
    updateBlinkStyles() {
      const styleId = 'event-alarm-blink-styles';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = `
        @keyframes blink-level-1 {
          0%, 100% { background-color: #f0f9ff; }
          50% { background-color: #c9e6ff; }
        }
        @keyframes blink-level-2 {
          0%, 100% { background-color: #fef6e6; }
          50% { background-color: #fde8b3; }
        }
        @keyframes blink-level-3 {
          0%, 100% { background-color: #ffeded; }
          50% { background-color: #ffc9c9; }
        }
        @keyframes blink-level-4 {
          0%, 100% { background-color: #e8f4f8; }
          50% { background-color: #aed6f1; }
        }
        @keyframes blink-level-5 {
          0%, 100% { background-color: #f5e6ff; }
          50% { background-color: #d1a2ff; }
        }
        @keyframes blink-level-6 {
          0%, 100% { background-color: #e8f8e8; }
          50% { background-color: #a3e4a3; }
        }
        .vxe-grid .vxe-body--row.blink-level-1 {
          animation: blink-level-1 ${this.blinkSpeed} infinite;
        }
        .vxe-grid .vxe-body--row.blink-level-2 {
          animation: blink-level-2 ${this.blinkSpeed} infinite;
        }
        .vxe-grid .vxe-body--row.blink-level-3 {
          animation: blink-level-3 ${this.blinkSpeed} infinite;
        }
        .vxe-grid .vxe-body--row.blink-level-4 {
          animation: blink-level-4 ${this.blinkSpeed} infinite;
        }
        .vxe-grid .vxe-body--row.blink-level-5 {
          animation: blink-level-5 ${this.blinkSpeed} infinite;
        }
        .vxe-grid .vxe-body--row.blink-level-6 {
          animation: blink-level-6 ${this.blinkSpeed} infinite;
        }
        .vxe-grid .vxe-body--row.row-level-1-ack{
          background-color: #ffcccc;
        }
        .vxe-grid .vxe-body--row.row-level-2-ack{
          background-color: #ccffcc;
        }
        .vxe-grid .vxe-body--row.row-level-3-ack{
          background-color: #ccccff;
        }
        .vxe-grid .vxe-body--row.row-level-4-ack{
          background-color: #aed6f1;
        }
        .vxe-grid .vxe-body--row.row-level-5-ack{
          background-color: #d1a2ff;
        }
        .vxe-grid .vxe-body--row.row-level-6-ack{
          background-color: #a3e4a3;
        }
      `;
    },
    eventCodeToLevel(eventCode) {
      switch (eventCode) {
        case 'E001':
          return 1;
        case 'E002':
          return 2;
        case 'E003':
          return 3;
        case 'E004':
          return 4;
        case 'E005':
          return 5;
        default:
          return 0;
      }
    },
    rowClassName({ row }) {
      const isAck = "1" === row.isAck || 1 === row.isAck || true === row.isAck;
      let cls = ''
      if (!this.globalBlinking && !isAck) return cls;
      const level = this.eventCodeToLevel(row.eventCode);
      if (isAck){
        switch (level) {
          case 1:
            cls =  'row-level-1-ack';break;
          case 2:
            cls =  'row-level-2-ack';break;
          case 3:
            cls =  'row-level-3-ack';break;
          case 4:
            cls =  'row-level-4-ack';break;
          case 5:
            cls =  'row-level-5-ack';break;
          case 6:
            cls =  'row-level-6-ack';break;
          default: cls = '';
        }
      }else {
        switch (level) {
          case 1:
            cls =  'blink-level-1';break;
          case 2:
            cls =  'blink-level-2';break;
          case 3:
            cls =  'blink-level-3';break;
          case 4:
            cls =  'blink-level-4';break;
          case 5:
            cls =  'blink-level-5';break;
          case 6:
            cls =  'blink-level-6';break;
          default:cls =  '';
        }
      }
      return cls;
    },
    toggleGlobalBlinking() {
      this.globalBlinking = !this.globalBlinking;
    },
    updateAckData(ackedData,ackData) {
      ackedData.forEach(item => {
        item.isAck = ackData.isAck;
        item.ackTime = ackData.ackTime;
        item.ackUser = ackData.ackUser;
      })
    },
    async ackEventAlarms(a,t) {
      const tip = t ? t : "是否进行确认处理?";
      Array.isArray(a) || (a = [a]);
      const ackTimeStamp = new Date().getTime();
      const ackQryParams = a.map(item => {
        return {
          id: item.id,
          isAck: 1,
          ackTime: ackTimeStamp,
          ackUser: this.ackUserName
        }
      })
      await this.$modal.confirm(tip)
      try {
        await EventCardWarningApi.ackEventCardWarning(ackQryParams)
        // await this.getList();
        this.updateAckData(a,{
          isAck: 1,
          ackTime: formatTimestamp(ackTimeStamp),
          ackUser: this.ackUserName
        })
        this.$modal.msgSuccess("确认成功");
      } catch {}
    },
    async ackBtnClick(row) {
      await this.ackEventAlarms(row,'是否确认对该事件进行确认处理?')
    },
    async ackCurrentPage() {
      const ackData = this.gridOptions.data.filter(item =>
        item.isAck === "0" || item.isAck === 0 || item.isAck === false
      );
      if (ackData.length > 0) {
        await this.ackEventAlarms(ackData);
      }else {
        this.$modal.msgError("当前页面没有未确认的告警记录");
      }
    },
    /** 查询列表 */
    async getList() {
      try {
        this.loading = true;
        const res = await EventCardWarningApi.getEventCardWarningPage(this.queryParams);
        this.gridOptions.data = res.data.list;
        this.total = res.data.total;
      } finally {
        this.loading = false;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 删除按钮操作 */
    /*async handleDelete(row) {
      const id = row.id;
      await this.$modal.confirm('是否确认删除该表存储员工门禁告警事件相关信息编号为"' + id + '"的数据项?')
      try {
        await EventCardWarningApi.deleteEventCardWarning(id);
        await this.getList();
        this.$modal.msgSuccess("删除成功");
      } catch {
      }
    },*/
    /** 导出按钮操作 */
    async handleExport() {
      await this.$modal.confirm('是否确认导出所有该表存储员工门禁告警事件相关信息数据项?');
      try {
        this.exportLoading = true;
        const data = await EventCardWarningApi.exportEventCardWarningExcel(this.queryParams);
        this.$download.excel(data, '该表存储员工门禁告警事件相关信息.xls');
      } catch {
      } finally {
        this.exportLoading = false;
      }
    },
  }
};
</script>

<style scoped>
.vg-content {
  height: calc(100vh - 320px);
  overflow-y: auto;
}
.inline-center-div {
  display: inline;
  text-align: center;
  line-height: 2.5;
  vertical-align: middle;
}
</style>
