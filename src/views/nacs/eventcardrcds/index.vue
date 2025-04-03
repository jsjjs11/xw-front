<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="线路 ID" prop="lineId">
        <el-input v-model="queryParams.lineId" placeholder="请输入线路 ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="员工 ID" prop="employeeId">
        <el-input v-model="queryParams.employeeId" placeholder="请输入员工 ID" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="员工编号" prop="employeeCode">
        <el-input v-model="queryParams.employeeCode" placeholder="请输入员工编号" clearable
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
      <el-form-item label="门禁访问点名称" prop="dApName">
        <el-input v-model="queryParams.dApName" placeholder="请输入门禁访问点名称" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="事件 ID(平台)" prop="eventId">
        <el-input v-model="queryParams.eventId" placeholder="请输入事件 ID(平台)" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="事件名称(平台)" prop="eventName">
        <el-input v-model="queryParams.eventName" placeholder="请输入事件名称(平台)" clearable
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="事件时间" prop="eventTime">
        <el-date-picker v-model="queryParams.eventTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item label="0 - 正常，1 - 未授权" prop="result">
        <el-select v-model="queryParams.result" placeholder="请选择0 - 正常，1 - 未授权" clearable size="small">
          <el-option label="请选择字典生成" value=""/>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item label="备用字段 1" prop="bkField1">
        <el-input v-model="queryParams.bkField1" placeholder="请输入备用字段 1" clearable
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openForm(undefined)"
                   v-hasPermi="['nacs:event-card-rcds:create']">新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
                   :loading="exportLoading"
                   v-hasPermi="['nacs:event-card-rcds:export']">导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <<!--el-table-column label="主键 ID" align="center" prop="id"/>-->
      <el-table-column label="线路 ID" align="center" prop="lineId"/>
      <el-table-column label="员工 ID" align="center" prop="employeeId"/>
      <el-table-column label="员工编号" align="center" prop="employeeCode"/>
      <el-table-column label="员工姓名" align="center" prop="employeeName"/>
      <el-table-column label="部门名称" align="center" prop="deptName"/>
      <el-table-column label="刷卡卡号" align="center" prop="cardNo"/>
      <el-table-column label="设备编号" align="center" prop="deviceCode"/>
      <el-table-column label="设备名称" align="center" prop="deviceName"/>
      <el-table-column label="门禁访问点名称" align="center" prop="dApName"/>
      <el-table-column label="事件 ID(平台)" align="center" prop="eventId"/>
      <el-table-column label="事件名称(平台)" align="center" prop="eventName"/>
      <el-table-column label="事件时间" align="center" prop="eventTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.eventTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="0 - 正常，1 - 未授权" align="center" prop="result"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备用字段 1" align="center" prop="bkField1"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="openForm(scope.row.id)"
                     v-hasPermi="['nacs:event-card-rcds:update']">修改
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['nacs:event-card-rcds:delete']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <EventCardRcdsForm ref="formRef" @success="getList"/>
  </div>
</template>

<script>
import * as EventCardRcdsApi from '@/api/nacs/eventcardrcds';
import EventCardRcdsForm from './EventCardRcdsForm.vue';

export default {
  name: "EventCardRcds",
  components: {
    EventCardRcdsForm,
  },
  data() {
    return {
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
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 选中行
      currentRow: {},
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        lineId: null,
        employeeId: null,
        employeeCode: null,
        employeeName: null,
        deptName: null,
        cardNo: null,
        deviceCode: null,
        deviceName: null,
        dApName: null,
        eventId: null,
        eventName: null,
        eventTime: [],
        result: null,
        createTime: [],
        bkField1: null,
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    async getList() {
      try {
        this.loading = true;
        const res = await EventCardRcdsApi.getEventCardRcdsPage(this.queryParams);
        this.list = res.data.list;
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
    /** 添加/修改操作 */
    openForm(id) {
      this.$refs["formRef"].open(id);
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      const id = row.id;
      await this.$modal.confirm('是否确认删除门禁卡通行记录编号为"' + id + '"的数据项?')
      try {
        await EventCardRcdsApi.deleteEventCardRcds(id);
        await this.getList();
        this.$modal.msgSuccess("删除成功");
      } catch {
      }
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
  }
};
</script>
