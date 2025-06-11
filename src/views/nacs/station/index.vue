<template>
	<div class="app-container">
		<el-row :gutter="20" style="height: 100%;">
			<el-col :span="3">
				<div class="section-title">线路列表</div>
				<el-radio-group v-model="selectedLine" @change="onLineChange" style="width: 100%;">
					<el-timeline class="custom-timeline">
						<el-timeline-item v-for="line in lineList" :key="line.lineNo" size="large">
							<template #dot>
								<el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`"> {{ line.name }}</el-radio>
							</template>
						</el-timeline-item>
					</el-timeline>
				</el-radio-group>
			</el-col>
			<el-col :span="21">
				<el-table :data="stationList" :border="true" style="width: 100%;" 
					:loading="loading" :stripe="true" :show-overflow-tooltip="true">
					<el-table-column label="站点编号" prop="stationNo" align="center"></el-table-column>
					<el-table-column label="站点名称" prop="name" align="center"></el-table-column>
					<el-table-column label="站点类型" prop="stationType" align="center"></el-table-column>
					<!-- <el-table-column label="所属线路" prop="lineName" align="center"></el-table-column> -->
					<el-table-column label="是否中转站" prop="transfer" align="center">
						<template slot-scope="scope">
							{{ scope.row.transfer === '1' ? '是' : '否' }}
						</template>
					</el-table-column>
					<!-- <el-table-column label="创建时间" prop="createTime" align="center"></el-table-column>
					<el-table-column label="更新时间" prop="updateTime" align="center"></el-table-column>
					<el-table-column label="排序" prop="sort" align="center"></el-table-column> -->
				</el-table>
			</el-col>
		</el-row>
	</div>
</template>
<script>
import {getLineDatas} from "@/utils/dict";
import * as LineApi from '@/api/nacs/line';
export default {
	name: 'StationIndex',
	data() {
		return {
			selectedLine: '',
			lineList: getLineDatas(),
			stationList: [],
			loading: false,
		}
	},
	mounted() {
    if(this.lineList.length>1){
      this.selectedLine = this.lineList[0].lineNo
    }
    this.onLineChange(); // 默认载入第一条线路的站点
  },
	methods: {
		async onLineChange() {
			try {
				this.loading = true;
				const res = await LineApi.line2Station({lineNo:this.selectedLine});
				if (res) {
					this.stationList = res.data;
					console.log(this.stationList);
				}
				
			} catch (error) {
				console.log(error);
				this.$message.error('获取线路站点失败');
			}
		},
		
	}
}
</script>
<style lang="scss" scoped>
.custom-timeline{
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
::v-deep(.custom-timeline-station)  .el-timeline-item {
  padding-bottom: 30px;
}
::v-deep .el-timeline-item {
  padding-bottom: 40px;
}

/* 自定义滚动条样式 */
.custom-timeline::-webkit-scrollbar {
  width: 6px;
}

.custom-timeline::-webkit-scrollbar-thumb {
  background-color: #909399;
  border-radius: 3px;
}

.custom-timeline::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}
::v-deep .el-table {
	flex:1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	height: calc(100vh - 140px);
	.el-table__header-wrapper {
		position: sticky;
		top: 0;
		z-index: 2;
		background: white;
	}
	
}
::v-deep .el-table__body-wrapper {
	overflow-y: auto !important;
	flex:1;
}
</style>