<template>
	<div class="app-container">
		<!-- 查询表单 -->
		<el-form :inline="true" :model="queryParams" size="small" ref="queryForm" class="search-form">
			<el-form-item label="审核单号">
				<el-input v-model="queryParams.authNo" placeholder="请输入审核单号" clearable
					@keyup.enter.native="handleSearch"></el-input>
			</el-form-item>
			<!-- <el-form-item label="发起人">
				<el-input v-model="queryParams.checkUser" placeholder="请输入发起人"></el-input>
			</el-form-item> -->
			<el-form-item label="负责人">
				<el-input v-model="queryParams.leaderUserId" placeholder="请输入负责人" clearable
					@keyup.enter.native="handleSearch"></el-input>
			</el-form-item>
			<el-form-item label="审核状态">
				<el-select v-model="queryParams.reviewState" placeholder="请选择审核状态" clearable
					@keyup.enter.native="handleSearch">
					<el-option v-for="dict in checkStateDictDatas" :key="parseInt(dict.value)" :label="dict.label"
						:value="parseInt(dict.value)"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="发起时间">
				<el-date-picker v-model="queryParams.createTime" type="daterange" range-separator="至"
					start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"
					:default-time="['00:00:00', '23:59:59']">
				</el-date-picker>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
				<el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
			</el-form-item>
		</el-form>
		<div class="table-container">
			<el-table ref="tableRef" :data="list" style="width: 100%; height: 655px;" v-loading="loading" :stripe="true"
				:show-overflow-tooltip="true" row-key="authNo" height="calc(100vh - 220px)">
				<el-table-column type="selection" width="45" align="center" :reserve-selection="true"></el-table-column>
				<el-table-column type="index" width="40" align="center" />
				<el-table-column label="审核单号" align="center" prop="authNo"></el-table-column>
				<el-table-column label="发起时间" align="center" prop="createTime"></el-table-column>
				<el-table-column label="权限类型" align="center" prop="authType">
					<template slot-scope="scope">
						<dict-tag :type="DICT_TYPE.NACS_AUTH_TYPE" :value="scope.row.authType" />
					</template>
				</el-table-column>
				<!-- <el-table-column label="发起人" align="center" prop="checkUser"></el-table-column> -->
				<el-table-column label="审核状态" align="center" prop="reviewState">
					<template slot-scope="scope">
						<dict-tag :type="DICT_TYPE.NACS_CHECK_STATE" :value="scope.row.reviewState" />
					</template>
				</el-table-column>
				<el-table-column label="负责人" align="center" prop="leaderUserName"></el-table-column>
				<el-table-column label="审核意见" align="center" prop="reviewOpinion"></el-table-column>
				<el-table-column label="操作" align="center" width="250">
					<template slot-scope="scope">
						<el-button type="text" @click.stop="handleView(scope.row)"
							:icon="activeRow === scope.row.authNo ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">{{
							activeRow === scope.row.authNo ? '收起' : '详情' }}</el-button>
						<el-button type="text" :disabled="scope.row.reviewState !== 0" @click="handleCheck(scope.row)"
							v-hasPermi="['nacs:authorize:check']">{{scope.row.reviewState === 0 ? '审核' :
							'已处理'}}</el-button>
					</template>
				</el-table-column>

				<!-- 展开详情 -->
				<el-table-column type="expand" width="1">
					<template #default="{ row }">
						<div v-show="activeRow === row.authNo" class="expand-content">
							<el-table :data="row.detailData" border height="380px" :row-class-name="tableRowClassName">
								<el-table-column label="员工姓名" prop="employeeName" align="center"
									width="180"></el-table-column>
								<el-table-column label="身份证号" prop="idCard" align="center"
									width="180"></el-table-column>
								<el-table-column label="卡号" prop="cardNo" align="center" width="180"></el-table-column>
								<el-table-column label="线路名称" prop="lineNo" align="center" width="100">
									<template v-slot="scope">
										<span>{{lineList.find(line => line.lineNo === scope.row.lineNo).name}}</span>
									</template>
								</el-table-column>
								<el-table-column label="车站" prop="stationName" align="center"
									width="100"></el-table-column>
								<el-table-column label="授权区域名称" prop="name" align="center">
									<template v-slot="scope">
										<span>{{scope.row.name}}</span>
									</template>
								</el-table-column>
								<el-table-column label="授权方式" prop="authMode" align="center" width="100">
									<template slot-scope="scope">
										<dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
									</template>
								</el-table-column>
								<el-table-column prop="authSource" label="权限来源" align="center" width="120">
									<template v-slot="scope">
									<dict-tag :type="DICT_TYPE.NACS_AUTH_SOURCE" :value="scope.row.authSource" />
									</template>
								</el-table-column>
								<el-table-column label="操作类型" prop="operateType" align="center" width="120">
									<template slot-scope="scope">
										<dict-tag :type="DICT_TYPE.NACS_OP_DATA_TYPE" :value="scope.row.operateType" />
									</template>
								</el-table-column>
								<el-table-column label="创建时间" prop="createTime" align="center" width="180">
									<template slot-scope="scope">
										{{ formatTimestamp(scope.row.createTime) }}
									</template>
								</el-table-column>
							</el-table>
						</div>
					</template>
				</el-table-column>

			</el-table>
			<pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo"
				:limit.sync="queryParams.pageSize" @pagination="getList" style="height: 50px;" />
		</div>
		<CheckForm ref="formRef" @success="getList" />
		<!-- <CheckForm ref="formRef" @success="handleCheckSuccess" /> -->
	</div>
</template>
<script>
import CheckForm from './checkForm.vue'
import * as CheckApi from '@/api/nacs/check'
import { DICT_TYPE, getDictDatas, getLineDatas } from "@/utils/dict";
export default {
	name: 'CheckIndex',
	components: {
		CheckForm
	},
	activated() {
		this.handleReset();
	},

	data() {
		return {
			lineList: getLineDatas(),
			list: [],
			total: 0,
			loading: false,
			queryParams: {
				pageNo: 1,
				pageSize: 10,
				authNo: null,
				leaderUserName: null,
        	reviewState: null,
        	createTime: []
			},
			checkStateDictDatas: getDictDatas(DICT_TYPE.NACS_CHECK_STATE),
			activeRow: null  // 当前展开行的id
		}
	},
	mounted() {
		this.getList();
	},
	methods: {
		/** 查询列表 */
    async getList() {
      try {
      	this.loading = true;
		const res = await CheckApi.getCheckPage(this.queryParams);
		if (res.data.list) {
			res.data.list.map(item => item.createTime = this.formatTimestamp(item.createTime))
		}
		this.list = res.data.list;
		this.total = res.data.total;
		this.activeRow = null;
      } finally {
        this.loading = false;
      }
    },
		formatTimestamp(timestamp) {
			const date = new Date(timestamp);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始需+1
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			const seconds = String(date.getSeconds()).padStart(2, '0');
			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		},
		/** 搜索按钮操作 */
    handleSearch() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    handleReset() {
      this.resetForm("queryForm");
		this.queryParams = {
        pageNo: 1,
        pageSize: 10,
        authNo: null,
        leaderUserName: null,
        reviewState: null,
        createTime: []
      };
      this.handleSearch();
    },
		/** 详情按钮操作 */
		async handleView(row) {
			try {
				if (this.activeRow === row.authNo) {
					this.activeRow = null;
					return;
				}
				this.loading = true;
				// 调用API获取详情数据
				const res = await CheckApi.getCheckDetail(row.authNo);
				// 合并详情数据到当前行
				this.list = this.list.map(item => {
					if (item.authNo === row.authNo) {
						return {
							...item,
							detailData: [...res.data]
						};
					}
					return item;
				});
				this.activeRow = row.authNo;
				this.$nextTick(() => {
					this.$refs.tableRef.toggleRowExpansion(row, true);
				})
			} catch (error) {
				console.error("获取详情失败", error);
				this.$modal.msgError("获取详情失败");
			} finally {
					this.loading = false;
			}
		},
		/** 审核按钮操作 */
		handleCheck(row) {
			this.$refs["formRef"].open(row);
		},
		tableRowClassName({row}) {
			if (row.operateType === 0) {
				return 'row-add';
			} else if (row.operateType === 1) {
				return 'row-update';
			} else if (row.operateType === 2) {
				return 'row-delete';
			}
			return '';
    },
	}
}
</script>
<style lang="scss" scoped>
::v-deep .el-table {
	// 展开行样式
	.expanded-row {
		background: #f8fafc !important;
		height: 0;
		overflow: hidden;
		td {
			border-bottom: 0 !important;
			padding: 0 !important;
		}
	}

	// 展开内容区域
	.expand-content {
		padding: 20px 20px;
		background: #f8fafc;
		border-top: 1px solid #ebeef5;
		height: 430px;
  		overflow-y: auto;
		margin: 0;
	}
}
::v-deep .el-table__expanded-cell {
	padding: 0px !important;
}
::v-deep {
	.row-add {
		background-color: #f0f9eb !important;  // 新增 - 浅绿色
	}
	.row-update {
		background-color: #fdf6ec !important;  // 修改 - 浅橙色
	}
	.row-delete {
		background-color: #fbdcdc !important;  // 删除 - 浅红色
	}
}

</style>
