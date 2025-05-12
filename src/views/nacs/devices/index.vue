<template>
  <div class="page-container">
    <el-row :gutter="20">
      <!-- 左侧区域：两列并排 -->
      <el-col :span="8">
        <el-row :gutter="10">
          <!-- 左侧：线路列表 -->
          <el-col :span="12">
            <div class="section-title">线路列表</div>
            <el-radio-group v-model="selectedLine" @change="onLineChange">
              <el-timeline class="custom-timeline">
                <el-timeline-item
                  v-for="line in lineList"
                  :key="line.lineNo"
                  size="large"
                >
                  <template #dot>
                  <el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`">   {{ line.name }}</el-radio>

                  </template>

                </el-timeline-item>
              </el-timeline>
            </el-radio-group>
          </el-col>

          <!-- 右侧：车站列表 -->
          <el-col :span="12">
            <div class="section-title">车站列表</div>
            <el-radio-group v-model="selectedStation" @change="onStationChange">
              <el-timeline class="custom-timeline custom-timeline-station">
                <el-timeline-item
                  v-for="station in stationList"
                  :key="station.stationNo"
                  size="large"
                >
                  <template #dot>
                    <el-radio :label="station.stationNo">{{ station.name }}</el-radio>
                  </template>

                </el-timeline-item>
              </el-timeline>
            </el-radio-group>
          </el-col>
        </el-row>
      </el-col>

      <!-- 右侧表格区域 -->
      <el-col :span="16">
        <el-table
          :data="tableData"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="deviceName" label="门禁名称" />
          <el-table-column prop="deviceType" label="线网设备类型" >
            <template v-slot="scope">
              <dict-tag :type="DICT_TYPE.NACS_DEVICE_TYPE" :value="scope.row.deviceType" />
            </template>
          </el-table-column>
          <el-table-column prop="stationName" label="站点" />
          <el-table-column prop="deviceBrand" label="门禁供应商" />
          <el-table-column prop="deviceManu" label="门禁品牌" />
          <el-table-column prop="deviceTime" label="启用时间" >
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.deviceTime) }}</span>
          </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                    @pagination="getList"/>
      </el-col>
    </el-row>

  </div>
</template>


<script>
import {getLineDatas} from "@/utils/dict";
import * as DevicesApi from '@/api/nacs/devices';
import * as LineApi from '@/api/nacs/line';

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        lineNo: null,
        stationNo: null,
        // stationName: null,
        // deviceCode: null,
        // deviceName: null,
        // deviceType: null,
        // devicePbcd: null,
        // deviceBcd: null,
        // deviceManu: null,
        // deviceBrand: null,
        // deviceStatus: null,
      },
      // 模拟线路
      lineList: getLineDatas(),
      // 当前选中的线路和车站
      selectedLine: '',
      selectedStation: null,

      // 车站列表（随线路变化）
      stationList: [],

      // 表格相关
      tableData: [],
      total: 0,
      pageSize: 10
    };
  },
  mounted() {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';

    const cssRules  = this.lineList
      .map(
        item => `
        .color-radio-${item.lineNo}  .el-radio__input.is-checked .el-radio__inner {
          background-color: ${item.color} !important;
          border-color: ${item.color} !important;
        }
        .color-radio-${item.lineNo}   .el-radio__inner {
          border: 2px solid ${item.color}; !important;

        }
      `
      )
      .join('\n')

    styleElement.innerHTML = cssRules;
    document.head.appendChild(styleElement);


    if(this.lineList.length>1){
      this.selectedLine = this.lineList[0].lineNo
    }
    this.onLineChange(); // 默认载入第一条线路的站点
  },
  methods: {
    async getList() {
      try {
        this.loading = true;
        const res = await DevicesApi.getDevicesPage(this.queryParams);
        this.tableData = res.data.list;
        this.total = res.data.total;
      } finally {
        this.loading = false;
      }
    },
    // 根据线路选择站点
    async onLineChange() {

      if(this.selectedLine){

        const res = await LineApi.line2Station({lineNo:this.selectedLine});
        // this.stationMap[this.selectedLine] = res.data
        this.stationList = res.data
        // this.stationList = stationMap[this.selectedLine] || [];
        this.selectedStation = this.stationList.length ? this.stationList[0].stationNo : null;

        this.onStationChange(); // 刷新右侧表格
      }

    },
    onStationChange() {
      this.queryParams.lineNo = this.selectedLine
      this.queryParams.stationNo = this.selectedStation
      this.getList();
    },
    loadTableData(page) {

    },
    handleSelectionChange(val) {
      console.log('选中项:', val);
    },
    handlePageChange(page) {
      this.loadTableData(page);
    }
  }
};
</script>

<style scoped >
.page-container {
  padding: 20px;
  min-height: 100%;
}


.custom-timeline{
  margin-top: 30px;
}

::v-deep .el-timeline-item__tail {
  left: 6px;
  margin-top: 10px;
}
::v-deep .el-timeline-item__timestamp.is-top {
  margin-bottom: 3px;
}
::v-deep(.custom-timeline-station)  .el-timeline-item {
  padding-bottom: 30px;
}
::v-deep .el-timeline-item {
  padding-bottom: 55px;
}

</style>
