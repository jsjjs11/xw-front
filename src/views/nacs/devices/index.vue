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
              <el-timeline>
                <el-timeline-item
                  v-for="line in lineList"
                  :key="line.lineNo"
                  size="large"
                >
                  <template #dot>
                  <el-radio :label="line.lineNo">{{ line.name }}</el-radio>
                  </template>
                </el-timeline-item>
              </el-timeline>
            </el-radio-group>
          </el-col>

          <!-- 右侧：车站列表 -->
          <el-col :span="12">
            <div class="section-title">车站列表</div>
            <el-radio-group v-model="selectedStation" @change="onStationChange">
              <el-timeline>
                <el-timeline-item
                  v-for="station in stationList"
                  :key="station.id"
                  size="large"
                >
                  <template #dot>
                  <el-radio :label="station.id">{{ station.name }}</el-radio>
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
          <el-table-column prop="name" label="门禁名称" />
          <el-table-column prop="line" label="线路" />
          <el-table-column prop="station" label="站点" />
          <el-table-column prop="supplier" label="门禁供应商" />
          <el-table-column prop="brand" label="门禁品牌" />
          <el-table-column prop="enabledTime" label="启用时间" />
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
export default {
  data() {
    return {
      // 遮罩层
      loading: true,
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
    console.log(111)
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
        this.list = res.data.list;
        this.total = res.data.total;
      } finally {
        this.loading = false;
      }
    },
    // 根据线路选择站点
    onLineChange() {
      // 模拟不同线路下的车站
      const stationMap = {
        L00001: [
          { id: 'station1', name: '黄梅站' },
          { id: 'station2', name: '汤山站' },
          { id: 'station3', name: '华阳站' }
        ],
        L00002: [
          { id: 'station4', name: '禁明站' },
          { id: 'station5', name: '句容站' }
        ]
      };
      this.stationList = stationMap[this.selectedLine] || [];
      this.selectedStation = this.stationList.length ? this.stationList[0].id : null;
      this.onStationChange(); // 刷新右侧表格
    },
    onStationChange() {
      this.loadTableData(1);
    },
    loadTableData(page) {
      // 模拟拉取当前站点门禁数据
      this.tableData = [
        {
          name: '门禁A',
          line: this.lineList.find(l => l.lineNo === this.selectedLine).name,
          station: this.stationList.find(s => s.id === this.selectedStation)?.name || '',
          supplier: '安朗杰',
          brand: '品牌X',
          enabledTime: '2024-01-01'
        }
      ];
      this.total = 1;
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

<style scoped>
.page-container {
  padding: 20px;
}
.left-panel {
  border-right: 1px solid #ebeef5;
  padding-right: 10px;
  max-height: 600px;
  overflow-y: auto;
}
.table-actions {
  margin-bottom: 10px;
}
::v-deep .el-timeline-item__tail {
  top: 10px;
  left: 10px;
}
::v-deep .el-timeline-item__dot {
  left: 4px;
}
</style>
