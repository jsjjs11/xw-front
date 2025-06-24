<template>
    <div class="page-container">
        <el-row :gutter="20" style="height: 100%;">
            <!-- 左侧：线路选择 -->
            <el-col :span="2">
                <div class="section-title">线路列表</div>
                <el-radio-group v-model="selectedLine" @change="onLineChange" style="width: 100%;">
                    <el-timeline class="custom-timeline">
                        <el-timeline-item v-for="line in lineList" :key="line.lineNo" size="large">
                            <template #dot>
                                <el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`">{{ line.name
                                    }}</el-radio>
                            </template>
                        </el-timeline-item>
                    </el-timeline>
                </el-radio-group>
            </el-col>
            <!-- 右侧：表格 -->
            <el-col :span="22">
                <el-table :data="tableData" style="width: 100%" height="calc(100vh - 160px)">
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
                <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo"
                    :limit.sync="queryParams.pageSize" @pagination="getList" />
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { getLineDatas } from '@/utils/dict';
export default {
  name: 'CardsRecords',
  data() {
    return {
      lineList: getLineDatas(),
      selectedLine: '',
      tableData: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        lineNo: null
      }
    };
  },
  mounted() {
    if (this.lineList.length > 0) {
      this.selectedLine = this.lineList[0].lineNo;
    }
    this.getList();
  },
  methods: {
    onLineChange() {
      this.queryParams.lineNo = this.selectedLine;
      this.queryParams.pageNo = 1;
      this.getList();
    },
    getList() {
      // mock数据
      const allData = [
    {
      lineNo: '1号线',
      cardNo: '123456789',
      cardFlag: '是',
      keyPass: '888888',
      employeeCode: 'EMP001',
      idCard: '320123199001011234',
      cardType: '员工卡',
      cardState: '正常',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      dataMode: '线网下发',
      dataType: '新增',
      operState1: '成功',
      operTime1: '2023-06-01 10:00:00',
      operMessage1: '下发成功',
      operState2: '', 
      operTime2: '',
      operMessage2: ''
    },
    {
      lineNo: '2号线',
      cardNo: '987654321',
      cardFlag: '否',
      keyPass: '666666',
      employeeCode: 'EMP002',
      idCard: '320123199002022345',
      cardType: '临时卡',
      cardState: '已注销',
      startDate: '2023-02-01',
      endDate: '2023-12-31',
      dataMode: '线路上传',
      dataType: '修改',
      operState1: '',
      operTime1: '',
      operMessage1: '',
      operState2: '失败',
      operTime2: '2023-06-02 11:05:00',
      operMessage2: '上传失败'
    }
        
    ];
      // 分页
      const start = (this.queryParams.pageNo - 1) * this.queryParams.pageSize;
      const end = start + this.queryParams.pageSize;
      this.tableData = allData.slice(start, end);
      this.total = allData.length;
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
