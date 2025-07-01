/**
* @description: 修改前端分组处理
* @author: chj
* @date: 2025/6/18 13:36
* @version: v1.0
*/
<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="线路信息" prop="lineNo">
        <el-input v-model="queryParams.lineNo" placeholder="请输入线路号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="员工身份证" label-width="85px" prop="idCard">
        <el-input v-model="queryParams.idCard" placeholder="请输入员工身份证" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="员工姓名" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工姓名" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="部门名称" prop="deptName">
        <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="刷卡卡号" prop="cardNo">
        <el-input v-model="queryParams.cardNo" placeholder="请输入刷卡卡号" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备编号" prop="deviceCode">
        <el-input v-model="queryParams.deviceCode" placeholder="请输入设备编号" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="事件名称" prop="eventName">
        <el-input v-model="queryParams.eventName" placeholder="请输入事件名称(平台)" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="事件时间" prop="eventTime">
        <el-date-picker v-model="queryParams.eventTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <vxe-button status="primary" size="mini" @click="handleRowGroup(['eventTime'])">时间分组</vxe-button>
      </el-col>
      <el-col :span="1.5">
        <vxe-button status="primary" size="mini" @click="handleRowGroup(['employeeName'])">持卡人分组</vxe-button>
      </el-col>
      <el-col :span="1.5">
        <vxe-button status="primary" size="mini" @click="handleRowGroup(['employeeName', 'eventTime'])">持卡人+时间分组</vxe-button>
      </el-col>
      <el-col :span="1.5">
        <vxe-button size="mini" @click="cancelRowGroup()">取消分组</vxe-button>
      </el-col>
      <el-col :span="1.5">
        <vxe-button status="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                   :loading="exportLoading"
                   v-hasPermi="['nacs:event-card-rcds:export']">后端导出
        </vxe-button>
      </el-col>
      <el-col :span="1.5">
        <vxe-button size="mini" :disabled="isCancelGrp" @click="toggleExpandAllGrp()">
          {{ isGrpExAll ? '收起所有分组' : '展开所有分组' }}
        </vxe-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <div class="vg-content">
      <vxe-grid ref="gridRef" v-bind="gridOptions">
        <template #resultTag="{row}">
          <vxe-tag status="success" v-if="row.result == 0">{{getDictDatas(DICT_TYPE.NACS_ACCESS_EVENT_RESULT)[0]['label']}}</vxe-tag>
          <vxe-tag status="error" v-if="row.result == 1">{{getDictDatas(DICT_TYPE.NACS_ACCESS_EVENT_RESULT)[1]['label']}}</vxe-tag>
        </template>
      </vxe-grid>
    </div>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import * as EventCardRcdsApi from '@/api/nacs/eventcardrcds';
import {DICT_TYPE} from "../../../utils/dict";
export default {
  name: "EventCardRcds",
  components: {},
  data() {
    const gridOptions = {
      // border: true,
      columnConfig: {
        resizable: true
      },
      expandConfig: {
        expandType: 'row',
        iconOpen: 'vxe-icon-arrow-down',
        iconClose: 'vxe-icon-arrow-up',
        expandAll: true
      },
      showFooter: true,
      showOverflow: true,
      aggregateConfig: {
        groupFields: ['eventTime'],
        showTotal: true,
        groupExpandAll: true,
        contentMethod({groupField,groupValue }) {
          if(groupField === 'eventTime'){
            // return `事件时间：<h1 v-html="html">${groupValue}</h1>`
            return `事件时间：${groupValue}`
          }
          return `持卡人：${groupValue}`
        },
        totalMethod({ children }) {
          return `共${children.length}项`
        }
      },
      loadingConfig: {
        icon: 'vxe-icon-indicator roll',
        text: '正在加载中...'
      },
      columns: [
        { type: 'seq', width: 48 },
        //{ field: 'eventTime', title: '事件时间' ,rowGroupNode: true, sortable: true,slots:{default:'timeRender'}},
        { field: 'eventTime', title: '事件时间' ,rowGroupNode: true, sortable: true},
        { field: 'eventCode', title: '事件编码' },
        { field: 'eventName', title: '事件名称' },
        { field: 'lineNo', title: '线路'},
        { field: 'idCard', title: '身份证' , minWidth: 80},
        { field: 'cardNo', title: '门禁卡号' },
        { field: 'employeeName', title: '持卡人' },
        { field: 'deptName', title: '所属部门' },
        { field: 'deviceCode', title: '设备编号' },
        { field: 'deviceName', title: '设备名称' },
        { field: 'result', title: '刷卡结果', slots:{default:'resultTag'}}
      ],
      data: []
    }
    return {
      gridOptions,
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 门禁卡通行记录列表
      list: [],
      // 选中行
      currentRow: {},
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        lineNo: null,
        idCard: null,
        employeeCode: null,
        employeeName: null,
        departmentID: null,
        deptName: null,
        cardNo: null,
        deviceCode: null,
        deviceName: null,
        eventCode: null,
        eventName: null,
        eventTime: [],
        result: null,
        createTime: [],
        bkField1: null,
      },
      isGrpExAll: false,
      isCancelGrp: false,
      rules: {
        idCard: [
          /*{ required: true, message: "身份证号不能为空", trigger: "blur" },*/
          {pattern:/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证格式不正确' }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  mounted() {
  },
  watch: {
  },
  methods: {
    /** 查询列表 */
    async getList() {
      try {
        this.loading = true;
        const res = await EventCardRcdsApi.getEventCardRcdsPage(this.queryParams);
        this.gridOptions.data = res.data.list;
        this.total = res.data.total;
        this.$nextTick(() => {
          this.expandAll(true);
          console.log(DICT_TYPE);
          console.log(this.getDictDatas(DICT_TYPE.NACS_ACCESS_EVENT_RESULT)[0]['label']);
          console.log(this.$store);
          console.log(this);
          console.log(this.$store.getters.dict_datas);
          console.log(this.$store.getters.dict_datas[DICT_TYPE.NACS_ACCESS_EVENT_RESULT]);
        });
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

    /** 导出按钮操作 */
    async handleExport() {
      await this.$modal.confirm('是否确认导出所有门禁卡通行记录数据项?');
      try {
        this.exportLoading = true;
        const data = await EventCardRcdsApi.exportEventCardRcdsExcel(this.queryParams);
        this.$download.excel(data, '门禁卡通行记录.xls');
      } catch {
      } finally {
        this.exportLoading = false;
      }
    },
    ///////////////////////
    formatTimestamp(timestamp) { // 后端@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8") 不起效，后续再查找问题
      const date = new Date(timestamp);
      const yyyy = date.getFullYear();
      const MM = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
      const dd = String(date.getDate()).padStart(2, '0');
      const HH = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
    },

    handleRowGroup(fields) {
      const $grid = this.$refs.gridRef
      if ($grid) {
        $grid.setRowGroups(fields)
        this.isCancelGrp = false;
        this.isGrpExAll = true;
      }
    },
    cancelRowGroup() {
      const $grid = this.$refs.gridRef
      if ($grid) {
        $grid.clearRowGroups()
        this.isCancelGrp = true;
        this.isGrpExAll = false
      }
    },
    expandRowGroup(groupIndex){
      const $grid = this.$refs.gridRef;
      if ($grid) {
        const groupRows = $grid.getGroupRows(); // 获取所有分组行
        if (groupRows && groupRows[groupIndex]) {
          $grid.toggleRowGroupExpand(groupRows[groupIndex], true); // 展开指定分组
        }
      }
    },
    // 收起指定分组
    collapseRowGroup(groupIndex){
      const $grid = this.$refs.gridRef;
      if ($grid) {
        const groupRows = $grid.getGroupRows();
        if (groupRows && groupRows[groupIndex]) {
          $grid.toggleRowGroupExpand(groupRows[groupIndex], false);
        }
      }
    },
    toggleExpandAllGrp() {
      this.isGrpExAll = !this.isGrpExAll
      this.expandAll(this.isGrpExAll);
    },
    expandAll(expanded) {
      const $grid = this.$refs.gridRef;
      $grid.setAllRowGroupExpand(expanded);
      this.isGrpExAll = expanded;
      /*$grid.setAllRowExpand(expanded); // 展开所有行
      $grid.setRowExpand(1, false)
      $grid.setRowExpand(1, true)*/
      /*this.collapseRowGroup(0);
      this.expandRowGroup(0);*/
    }

  }
};
</script>

<style lang="scss" scoped>
/*::v-deep .vxe-grid--layout-body-content-wrapper {
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  flex-grow: 1;
  overflow: auto;
  height: calc(100vh - 320px);
}*/
.vg-content {
  height: calc(100vh - 320px);
  overflow-y: auto;
}
</style>
