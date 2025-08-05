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
			<!-- 右侧：表格 -->
			<el-col :span="21" style="width: 88%;">
				<el-table :data="tableData" style="width: 100%" height="calc(100vh - 160px)">
					<el-table-column type="selection" width="55" />
					<el-table-column prop="deviceCode" label="设备ID" />
					<el-table-column prop="lineNo" label="线路ID" />
					<el-table-column prop="stationNo" label="车站ID" />
					<el-table-column prop="stationName" label="车站名称" />
					<el-table-column prop="deviceCode" label="设备编码" />
					<el-table-column prop="deviceName" label="设备名称" />
					<el-table-column prop="deviceType" label="设备类型" />
					<el-table-column prop="devicePbcd" label="设备物理编码" />
					<el-table-column prop="deviceBcd" label="设备逻辑编码" />
					<el-table-column prop="deviceCom" label="设备通讯方式" />
					<el-table-column prop="deviceManu" label="设备厂商" />
					<el-table-column prop="deviceBrand" label="设备品牌" />
					<el-table-column prop="remark" label="备注" />
          <el-table-column prop="dataMode" label="数据模式">
            <template v-slot="scope">
              <dict-tag :type="DICT_TYPE.NACS_OP_DATA_MODE" :value="scope.row.dataMode" />
            </template>
          </el-table-column>
          <el-table-column prop="dataType" label="数据操作类型">
            <template v-slot="scope">
              <dict-tag :type="DICT_TYPE.NACS_OP_DATA_TYPE" :value="scope.row.dataType" />
            </template>
          </el-table-column>
          <el-table-column prop="operState1" label="线网下发操作状态">
            <template v-slot="scope">
              <dict-tag :type="DICT_TYPE.NACS_PROCESS_STATE" :value="scope.row.operState1" />
            </template>
          </el-table-column>
					<el-table-column prop="operTime1" label="线网下发操作时间" />
					<el-table-column prop="operMessage1" label="线网下发操作消息" />
          <el-table-column prop="operState2" label="线路上传操作状态">
            <template v-slot="scope">
              <dict-tag :type="DICT_TYPE.NACS_PROCESS_STATE" :value="scope.row.operState2" />
            </template>
          </el-table-column>
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
import * as SynchronizeApi from '@/api/nacs/synchronizerecords';
export default {
	name: 'DeviceRecords',
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
		async getList() {
			try {
				this.queryParams.lineNo = this.selectedLine;
				const res = await SynchronizeApi.getSynchronizeDeviceRecords(this.queryParams);
				this.tableData = res.data.list;
				this.total = res.data.total;
			} catch (error) {
				console.log(error);
			}
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
