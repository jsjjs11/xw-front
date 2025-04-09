<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="线路 ID" prop="lineId">
        <el-input v-model="queryParams.lineId" placeholder="请输入线路 ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="车站 ID" prop="stationId">
        <el-input v-model="queryParams.stationId" placeholder="请输入车站 ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="车站名称" prop="stationName">
        <el-input v-model="queryParams.stationName" placeholder="请输入车站名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="门禁系统ID" prop="deviceCode">
        <el-input v-model="queryParams.deviceCode" placeholder="请输入门禁系统唯一编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select v-model="queryParams.deviceType" placeholder="请选择设备类型" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.NACS_DEVICE_TYPE)"
                       :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="上级设备BCD" prop="devicePbcd">
        <el-input v-model="queryParams.devicePbcd" placeholder="请输入上级设备编码 BCD" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="本级设备BCD" prop="deviceBcd">
        <el-input v-model="queryParams.deviceBcd" placeholder="请输入本级设备编码 BCD" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备厂商" prop="deviceManu">
        <el-input v-model="queryParams.deviceManu" placeholder="请输入设备厂商" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备品牌" prop="deviceBrand">
        <el-input v-model="queryParams.deviceBrand" placeholder="请输入设备品牌" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="设备当前状态" prop="deviceStatus">
        <el-select v-model="queryParams.deviceStatus" placeholder="请选择设备当前状态" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                       :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['nacs:devices:export']">导出</el-button>
      </el-col>
              <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

            <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
            <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="线路 ID" align="center" prop="lineId" />
      <el-table-column label="车站 ID" align="center" prop="stationId" />
      <el-table-column label="车站名称" align="center" prop="stationName" />
      <el-table-column label="门禁系统" align="center" prop="deviceCode" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="设备类型" align="center" prop="deviceType">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.NACS_DEVICE_TYPE" :value="scope.row.deviceType" />
        </template>
      </el-table-column>
      <el-table-column label="上级设备BCD" align="center" prop="devicePbcd" />
      <el-table-column label="本级设备BCD" align="center" prop="deviceBcd" />
      <el-table-column label="设备通讯配置参数" align="center" prop="deviceCom" />
      <el-table-column label="设备厂商" align="center" prop="deviceManu" />
      <el-table-column label="设备品牌" align="center" prop="deviceBrand" />
      <el-table-column label="设备状态" align="center" prop="deviceStatus">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.deviceStatus" />
        </template>
      </el-table-column>
      <el-table-column label="设备状态更新时间" align="center" prop="deviceTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.deviceTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    </div>
</template>

<script>
import * as DevicesApi from '@/api/nacs/devices';
export default {
  name: "Devices",
  components: {
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
      // 门禁相关设备监控列表
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
        stationId: null,
        stationName: null,
        deviceCode: null,
        deviceName: null,
        deviceType: null,
        devicePbcd: null,
        deviceBcd: null,
        deviceManu: null,
        deviceBrand: null,
        deviceStatus: null,
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
              const res = await DevicesApi.getDevicesPage(this.queryParams);
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
    /** 删除按钮操作 */
    async handleDelete(row) {
      const id = row.id;
      await this.$modal.confirm('是否确认删除门禁相关设备监控编号为"' + id + '"的数据项?')
      try {
       await DevicesApi.deleteDevices(id);
       await this.getList();
       this.$modal.msgSuccess("删除成功");
      } catch {}
    },
    /** 导出按钮操作 */
    async handleExport() {
      await this.$modal.confirm('是否确认导出所有门禁相关设备监控数据项?');
      try {
        this.exportLoading = true;
        const data = await DevicesApi.exportDevicesExcel(this.queryParams);
        this.$download.excel(data, '门禁相关设备监控.xls');
      } catch {
      } finally {
        this.exportLoading = false;
      }
    },
              }
};
</script>
