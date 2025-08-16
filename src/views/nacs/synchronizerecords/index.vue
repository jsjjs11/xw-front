<template>
  <div class="page-container">
    <el-row :gutter="20" style="height: 100%;">
      <!-- 左侧：线路选择 -->
      <el-col :span="3" style="width: 12%; max-width: 200px">
        <div class="section-title">线路列表</div>
        <el-radio-group v-model="selectedLine" @change="onLineChange" style="width: 100%;">
          <el-timeline class="custom-timeline">
            <el-timeline-item v-for="line in lineList" :key="line.lineNo" size="large">
              <template #dot>
                <el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`">{{ line.name }}</el-radio>
              </template>
            </el-timeline-item>
          </el-timeline>
        </el-radio-group>
      </el-col>
      <!-- 右侧：Tab切换表格 -->
      <el-col :span="21" style="width: 88%;">
        <el-tabs v-model="activeTab" type="card" @tab-click="onTabChange">
          <el-tab-pane label="卡授权" name="cardauth">
            <el-table :data="tableData_cardauth" style="width: 100%" height="calc(100vh - 220px)">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="authId" label="授权ID" />
              <el-table-column prop="lineNo" label="线路" />
              <el-table-column prop="employeeCode" label="员工编码" />
              <el-table-column prop="idCard" label="身份证号" />
              <el-table-column prop="cardNo" label="卡号" />
              <el-table-column prop="groupCode" label="门禁权限组" />
              <el-table-column prop="groupName" label="门禁权限组名称" />
              <el-table-column prop="deviceCode" label="设备ID" />
              <el-table-column prop="deviceName" label="设备名称" />
              <el-table-column prop="authMode" label="授权模式" />
              <el-table-column prop="timeCode" label="时间段编码" />
              <el-table-column prop="startDate" label="有效开始日期" />
              <el-table-column prop="endDate" label="有效结束时间" />
              <el-table-column prop="dataMode" label="数据模式" />
              <el-table-column prop="dataType" label="操作类型" />
              <el-table-column prop="operState1" label="线网处理状态" />
              <el-table-column prop="operMessage1" label="线网处理消息" />
              <el-table-column prop="operTime1" label="线网处理时间" />
              <el-table-column prop="operState2" label="线路处理状态" />
              <el-table-column prop="operTime2" label="线路处理时间" />
              <el-table-column prop="operMessage2" label="线路处理消息" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="卡记录" name="cardsrecords">
            <el-table :data="tableData_cardsrecords" style="width: 100%" height="calc(100vh - 220px)">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="lineNo" label="线路" />
              <el-table-column prop="cardNo" label="卡号" />
              <el-table-column prop="cardFlag" label="是否为完整物理卡号" />
              <el-table-column prop="keyPass" label="键盘密码" />
              <el-table-column prop="employeeCode" label="员工编码" />
              <el-table-column prop="idCard" label="身份证号" />
              <el-table-column prop="cardType" label="卡类型" />
              <el-table-column prop="cardState" label="卡状态" />
              <el-table-column prop="startDate" label="开始日期" />
              <el-table-column prop="endDate" label="结束日期" />
              <el-table-column prop="dataMode" label="数据模式" />
              <el-table-column prop="dataType" label="数据操作类型" />
              <el-table-column prop="operState1" label="线网下发操作状态" />
              <el-table-column prop="operTime1" label="线网下发操作时间" />
              <el-table-column prop="operMessage1" label="线网下发操作消息" />
              <el-table-column prop="operState2" label="线路上传操作状态" />
              <el-table-column prop="operTime2" label="线路上传操作时间" />
              <el-table-column prop="operMessage2" label="线路上传操作消息" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="设备记录" name="device">
            <el-table :data="tableData_device" style="width: 100%" height="calc(100vh - 220px)">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="deviceId" label="设备ID" />
              <el-table-column prop="deviceName" label="设备名称" />
              <el-table-column prop="deviceType" label="设备类型" />
              <el-table-column prop="lineNo" label="线路" />
              <el-table-column prop="stationId" label="车站ID" />
              <el-table-column prop="operState1" label="线网下发操作状态" />
              <el-table-column prop="operTime1" label="线网下发操作时间" />
              <el-table-column prop="operMessage1" label="线网下发操作消息" />
              <el-table-column prop="operState2" label="线路上传操作状态" />
              <el-table-column prop="operTime2" label="线路上传操作时间" />
              <el-table-column prop="operMessage2" label="线路上传操作消息" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="分组记录" name="group">
            <el-table :data="tableData_group" style="width: 100%" height="calc(100vh - 220px)">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="groupCode" label="分组编码" />
              <el-table-column prop="groupName" label="分组名称" />
              <el-table-column prop="lineNo" label="线路" />
              <el-table-column prop="operState1" label="线网下发操作状态" />
              <el-table-column prop="operTime1" label="线网下发操作时间" />
              <el-table-column prop="operMessage1" label="线网下发操作消息" />
              <el-table-column prop="operState2" label="线路上传操作状态" />
              <el-table-column prop="operTime2" label="线路上传操作时间" />
              <el-table-column prop="operMessage2" label="线路上传操作消息" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="分组设备" name="groupequip">
            <el-table :data="tableData_groupequip" style="width: 100%" height="calc(100vh - 220px)">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="groupCode" label="分组编码" />
              <el-table-column prop="groupName" label="分组名称" />
              <el-table-column prop="deviceId" label="设备ID" />
              <el-table-column prop="deviceName" label="设备名称" />
              <el-table-column prop="lineNo" label="线路" />
              <el-table-column prop="operState1" label="线网下发操作状态" />
              <el-table-column prop="operTime1" label="线网下发操作时间" />
              <el-table-column prop="operMessage1" label="线网下发操作消息" />
              <el-table-column prop="operState2" label="线路上传操作状态" />
              <el-table-column prop="operTime2" label="线路上传操作时间" />
              <el-table-column prop="operMessage2" label="线路上传操作消息" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <!-- 总的分页组件 -->
        <pagination v-show="currentTotal > 0" :page-size="currentPageSize" :total="currentTotal"
            layout="total, prev, pager, next, sizes" @current-change="handlePageChange"
            @size-change="handleSizeChange" style="margin-top: 10px; text-align: right;" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getLineDatas } from '@/utils/dict';
import * as SynchronizeApi from '@/api/nacs/synchronizerecords';
import data from '@/views/system/dict/data.vue'
export default {
  name: 'SynchronizeRecordsTabs',
  data() {
    return {
      lineList: getLineDatas(),
      selectedLine: '',
      activeTab: 'cardauth',
      // 卡授权Tab分页参数
      pageNo_cardauth: 1,
      pageSize_cardauth: 10,
      total_cardauth: 0,
      tableData_cardauth: [],
      allData_cardauth: [
        {
          authId: 'A001', lineNo: '1号线', employeeCode: 'EMP001', idCard: '320123199001011234', cardNo: '123456789', groupCode: 'G01', groupName: '一组', deviceCode: 'D001', deviceName: '门禁1', authMode: '刷卡', timeCode: 'T01', startDate: '2023-01-01', endDate: '2024-12-31', dataMode: '线网下发', dataType: '新增', operState1: '成功', operMessage1: '下发成功', operTime1: '2023-06-01 10:00:00', operState2: '', operTime2: '', operMessage2: ''
        },
        {
          authId: 'A002', lineNo: '2号线', employeeCode: 'EMP002', idCard: '320123199002022345', cardNo: '987654321', groupCode: 'G02', groupName: '二组', deviceCode: 'D002', deviceName: '门禁2', authMode: '刷脸', timeCode: 'T02', startDate: '2023-02-01', endDate: '2023-12-31', dataMode: '线路上传', dataType: '修改', operState1: '', operMessage1: '', operTime1: '', operState2: '失败', operTime2: '2023-06-02 11:05:00', operMessage2: '上传失败'
        }
      ],
      // 卡记录Tab
      pageNo_cardsrecords: 1,
      pageSize_cardsrecords: 10,
      total_cardsrecords: 0,
      tableData_cardsrecords: [],
      allData_cardsrecords: [
        {
          lineNo: '1号线', cardNo: '123456789', cardFlag: '是', keyPass: '888888', employeeCode: 'EMP001', idCard: '320123199001011234', cardType: '员工卡', cardState: '正常', startDate: '2023-01-01', endDate: '2024-12-31', dataMode: '线网下发', dataType: '新增', operState1: '成功', operTime1: '2023-06-01 10:00:00', operMessage1: '下发成功', operState2: '', operTime2: '', operMessage2: ''
        },
        {
          lineNo: '2号线', cardNo: '987654321', cardFlag: '否', keyPass: '666666', employeeCode: 'EMP002', idCard: '320123199002022345', cardType: '临时卡', cardState: '已注销', startDate: '2023-02-01', endDate: '2023-12-31', dataMode: '线路上传', dataType: '修改', operState1: '', operTime1: '', operMessage1: '', operState2: '失败', operTime2: '2023-06-02 11:05:00', operMessage2: '上传失败'
        }
      ],
      // 设备记录Tab
      pageNo_device: 1,
      pageSize_device: 10,
      total_device: 0,
      tableData_device: [],
      allData_device: [
        {
          deviceId: 'D001', deviceName: '门禁1', deviceType: '门禁', lineNo: '1号线', stationId: 'S01', operState1: '成功', operTime1: '2023-06-01 10:00:00', operMessage1: '下发成功', operState2: '', operTime2: '', operMessage2: ''
        },
        {
          deviceId: 'D002', deviceName: '门禁2', deviceType: '门禁', lineNo: '2号线', stationId: 'S02', operState1: '', operTime1: '', operMessage1: '', operState2: '失败', operTime2: '2023-06-02 11:05:00', operMessage2: '上传失败'
        }
      ],
      // 分组记录Tab
      pageNo_group: 1,
      pageSize_group: 10,
      total_group: 0,
      tableData_group: [],
      allData_group: [
        {
          groupCode: 'G01', groupName: '一组', lineNo: '1号线', operState1: '成功', operTime1: '2023-06-01 10:00:00', operMessage1: '下发成功', operState2: '', operTime2: '', operMessage2: ''
        },
        {
          groupCode: 'G02', groupName: '二组', lineNo: '2号线', operState1: '', operTime1: '', operMessage1: '', operState2: '失败', operTime2: '2023-06-02 11:05:00', operMessage2: '上传失败'
        }
      ],
      // 分组设备Tab
      pageNo_groupequip: 1,
      pageSize_groupequip: 10,
      total_groupequip: 0,
      tableData_groupequip: [],
      allData_groupequip: [
        {
          groupCode: 'G01', groupName: '一组', deviceId: 'D001', deviceName: '门禁1', lineNo: '1号线', operState1: '成功', operTime1: '2023-06-01 10:00:00', operMessage1: '下发成功', operState2: '', operTime2: '', operMessage2: ''
        },
        {
          groupCode: 'G02', groupName: '二组', deviceId: 'D002', deviceName: '门禁2', lineNo: '2号线', operState1: '', operTime1: '', operMessage1: '', operState2: '失败', operTime2: '2023-06-02 11:05:00', operMessage2: '上传失败'
        }
      ]
    };
  },
  computed: {
    currentPage() {
      return this[`pageNo_${this.activeTab}`];
    },
    currentPageSize() {
      return this[`pageSize_${this.activeTab}`];
    },
    currentTotal() {
      return this[`total_${this.activeTab}`];
    }
  },
  mounted() {
    if (this.lineList.length > 0) {
      this.selectedLine = this.lineList[0].lineNo;
    }
    this.getList_cardauth();
    this.getList_cardsrecords();
    this.getList_device();
    this.getList_group();
    this.getList_groupequip();
  },
  methods: {
    onLineChange() {
      this.getList_cardauth();
      this.getList_cardsrecords();
      this.getList_device();
      this.getList_group();
      this.getList_groupequip();
    },
    onTabChange() {
      // 切换Tab时可做额外处理
    },
    // 各Tab分页方法
    async getList_cardauth() {
      const params = {
        pageNo: this.pageNo_cardauth,
        pageSize: this.pageSize_cardauth,
        lineNo: this.selectedLine
      }
      try {
        const res = await SynchronizeApi.getSynchronizeAuthRecords(params);
        this.tableData_cardauth = res.data.list;
        this.total_cardauth = res.data.total;
      } catch (error) {
        console.log(error);

      }
      // const start = (this.pageNo_cardauth - 1) * this.pageSize_cardauth;
      // const end = start + this.pageSize_cardauth;
      // this.tableData_cardauth = this.allData_cardauth.slice(start, end);

    },
    async getList_cardsrecords() {
      const params = {
        pageNo: this.pageNo_cardsrecords,
        pageSize: this.pageSize_cardsrecords,
        lineNo: this.selectedLine
      }
      try {
        // 日志点 1: 在调用 API 之前
        console.log("准备调用 API...");

        const res = await SynchronizeApi.getSynchronizeCardsRecords(params);

        // 日志点 2: 在成功拿到响应之后
        console.log("API 调用成功返回，这是响应数据:", res);
        //
        // this.tableData_cardsrecords = res.data.list;
        // this.total_cardsrecords = res.data.total;

        // 日志点 3: 在给表格赋值之后
        console.log("表格数据赋值完成。");
        // res.data.list =  [
        //   {
        //     end_date: "2026-07-17",
        //     oper_time2: 1752737202000,
        //     "create_time": 1752737202000,
        //     "card_flag": 1,
        //     "oper_time1": 1752737775000,
        //     "line_no": "00005",
        //     "id_card": "663772819190092",
        //     "card_type": "0",
        //     "data_mode": 0,
        //     "key_pass": "1234",
        //     "oper_message2": "执行成功",
        //     "employee_code": "223114",
        //     "card_state": 1,
        //     "card_no": "72726361822123",
        //     "data_type": 0,
        //     "id": 145,
        //     "oper_state2": 1,
        //     "start_date": "2025-07-17",
        //     "oper_state1": 1
        //   },
        //   {
        //     "end_date": "2026-07-18",
        //     "create_time": 1753147201000,
        //     "card_flag": 1,
        //     "oper_time1": 1753147800000,
        //     "line_no": "00005",
        //     "id_card": "663772819190092",
        //     "card_type": "0",
        //     "data_mode": 0,
        //     "key_pass": "1234",
        //     "employee_code": "223114",
        //     "card_state": 1,
        //     "card_no": "73738289212445",
        //     "data_type": 2,
        //     "id": 146,
        //     "oper_state2": 0,
        //     "start_date": "2025-07-18",
        //     "oper_state1": 1
        //   }
        // ];
        this.tableData_cardsrecords = res.data.list;
        this.total_cardsrecords = res.data.total;
      } catch (error) {
        console.log(error);
      }
      // const start = (this.pageNo_cardsrecords - 1) * this.pageSize_cardsrecords;
      // const end = start + this.pageSize_cardsrecords;
      // this.tableData_cardsrecords = this.allData_cardsrecords.slice(start, end);
      // this.total_cardsrecords = this.allData_cardsrecords.length;
    },
    async getList_device() {
      const params = {
        pageNo: this.pageNo_device,
        pageSize: this.pageSize_device,
        lineNo: this.selectedLine
      }
      try {
        const res = await SynchronizeApi.getSynchronizeDeviceRecords(params);
        this.tableData_device = res.data.list;
        this.total_device = res.data.total;
      } catch (error) {
        console.log(error);
      }
      // const start = (this.pageNo_device - 1) * this.pageSize_device;
      // const end = start + this.pageSize_device;
      // this.tableData_device = this.allData_device.slice(start, end);
      // this.total_device = this.allData_device.length;
    },
    async getList_group() {
      const params = {
        pageNo: this.pageNo_group,
        pageSize: this.pageSize_group,
        lineNo: this.selectedLine
      }
      try {
        // 日志点 1: 在调用 API 之前
        console.log("准备调用 API...");

        const res = await SynchronizeApi.getSynchronizeCardsRecords(params);

        // 日志点 2: 在成功拿到响应之后
        console.log("API 调用成功返回，这是响应数据:", res);

        this.tableData_cardsrecords = res.data.list;
        this.total_cardsrecords = res.data.total;

        // 日志点 3: 在给表格赋值之后
        console.log("表格数据赋值完成。");
      } catch (error) {
        console.log(error);
      }
      // const start = (this.pageNo_group - 1) * this.pageSize_group;
      // const end = start + this.pageSize_group;
      // this.tableData_group = this.allData_group.slice(start, end);
      // this.total_group = this.allData_group.length;
    },
    async getList_groupequip() {
      const params = {
        pageNo: this.pageNo_groupequip,
        pageSize: this.pageSize_groupequip,
        lineNo: this.selectedLine
      }
      try {
        const res = await SynchronizeApi.getSynchronizeGroupEquipRecords(params);
        this.tableData_groupequip = res.data.list;
        this.total_groupequip = res.data.total;
      } catch (error) {
        console.log(error);
      }
      // const start = (this.pageNo_groupequip - 1) * this.pageSize_groupequip;
      // const end = start + this.pageSize_groupequip;
      // this.tableData_groupequip = this.allData_groupequip.slice(start, end);
      // this.total_groupequip = this.allData_groupequip.length;
    },
    // 总分页事件
    handlePageChange(page) {
      this[`pageNo_${this.activeTab}`] = page;
      this[`getList_${this.activeTab}`]();
    },
    handleSizeChange(size) {
      this[`pageSize_${this.activeTab}`] = size;
      this[`pageNo_${this.activeTab}`] = 1;
      this[`getList_${this.activeTab}`]();
    }
  }
};
</script>

<style scoped>
.page-container {
  padding: 20px;
  min-height: 100%;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 1px;
}
.custom-timeline {
  width: 100%;
  margin-top: 30px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
::v-deep .el-timeline-item__tail {
  left: 6px;
  margin-top: 10px;
}
::v-deep .el-timeline-item__timestamp.is-top {
  margin-bottom: 3px;
}
::v-deep .el-timeline-item {
  padding-bottom: 40px;
}
</style>
