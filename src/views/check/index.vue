<template>
	<div class="app-container">
		<el-row :gutter="20">
			<el-col :span="20" >
				<!-- 查询表单 -->
				<el-form :inline="true" :model="queryForm" size="small" ref="queryForm" class="search-form">
					<el-form-item label="审核单号">
						<el-input v-model="queryForm.authNo" placeholder="请输入审核单号"></el-input>
					</el-form-item>
					<!-- <el-form-item label="发起人">
						<el-input v-model="queryForm.checkUser" placeholder="请输入发起人"></el-input>
					</el-form-item> -->
					<el-form-item label="负责人">
						<el-input v-model="queryForm.leaderUserId" placeholder="请输入负责人"></el-input>
					</el-form-item>
					<el-form-item label="审核状态">
						<el-select v-model="queryForm.status" placeholder="请选择状态">
							<el-option v-for="dict in checkStateDictDatas" :key = "parseInt(dict.value)" :label="dict.label"
							:value="parseInt(dict.value)"></el-option>
							<!-- <el-option label="待审核" value="0"></el-option>
							<el-option label="已通过" value="1"></el-option>
							<el-option label="已驳回" value="2"></el-option> -->
						</el-select>
					</el-form-item>
					<el-form-item label="发起时间">
						<el-date-picker
							v-model="queryForm.dateRange"
							type="daterange"
							range-separator="至"
							start-placeholder="开始日期"
							end-placeholder="结束日期">
						</el-date-picker>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
						<el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
		<div class="table-container">
			<el-table ref="tableRef" :data="list" style="width: 100%; height: 655px;" v-loading="loading" :stripe="true" 
				:show-overflow-tooltip="true" row-key="authNo" @row-click="handleRowClick">
				<el-table-column type="selection" width="45" align="center" :reserve-selection="true"></el-table-column>
				<el-table-column type="index" width="40" align="center" />
				<el-table-column label="审核单号" align="center" prop="authNo"></el-table-column>
				<el-table-column label="审核内容" align="center" prop="reviewContent"></el-table-column>
				<el-table-column label="发起时间" align="center" prop="createTime"></el-table-column>
				<!-- <el-table-column label="发起人" align="center" prop="checkUser"></el-table-column> -->
				<el-table-column label="审核状态" align="center" prop="reviewState">
					<template slot-scope="scope">
						<dict-tag :type="DICT_TYPE.NACS_CHECK_STATE" :value="scope.row.reviewState"/>
					</template>
				</el-table-column>
				<el-table-column label="负责人" align="center" prop="leaderUserId"></el-table-column>
				<el-table-column label="操作" align="center" width="250">
					<template slot-scope="scope">
						<el-button type="text" @click.stop="handleView(scope.row)" :icon="activeRow === scope.row.authNo ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
								>{{ activeRow === scope.row.authNo ? '收起' : '详情' }}</el-button>
						<el-button type="text" 
						:disabled="scope.row.reviewState !== 0"
						@click="handleCheck(scope.row)"
						v-hasPermi="['nacs:authorize:check']">{{scope.row.reviewState === 0 ? '审核' : '已处理'}}</el-button>
					</template>
				</el-table-column>

				<!-- 展开详情 -->
				<el-table-column type="expand" width="1">
					<template #default="{ row }">
						<div v-show="activeRow === row.authNo" class="expand-content">
							<div class="detail-grid">
								<!-- 左栏 -->
								<div class="detail-column">
									<div class="detail-item">
										<label>申请卡号：</label>
										<span class="highlight">{{ row.cardNo }}</span>
									</div>
									<div class="detail-item">
										<label>权限授予人：</label>
										<span>{{ row.idCard }}</span> 
										<!-- employeeName -->
									</div>
									<div class="detail-item">
										<label>授权时间段：</label>
										<span>{{ row.timePeriodId }}</span>
									</div>
								</div>

								<!-- 右栏 -->
								<div class="detail-column">
									<!-- <div class="detail-item">
										<label>授权方式：</label>
										<el-tag :type="row.authMode">
											{{ row.authMode }}
										</el-tag>
									</div> -->
									<div class="detail-item">
										<label>授权门禁点：</label>
										<span>{{ row.deviceName }}</span>
									</div>
									<div class="detail-item">
										<label>授权门禁权限组：</label>
										<span>{{ row.groupName }}</span>
									</div>
								</div>

								<!-- 底部全宽内容 -->
								<div class="full-width" v-if="row.remark">
									<div class="detail-section">
										<h4><i class="el-icon-document"></i> 备注 </h4>
										<p class="remark-text">{{ row.remark }}</p>
									</div>
								</div>
							</div>
						</div>
					</template>
				</el-table-column>

			</el-table>
			<pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
				@pagination="getList"/>
		</div>
		<CheckForm ref="formRef" @success="getList" />
	</div>
</template>
<script>
import CheckForm from './checkForm.vue'
import * as CheckApi from '@/api/nacs/check'
import {DICT_TYPE, getDictDatas} from "@/utils/dict";
export default {
	name: 'CheckIndex',
	components: {
		CheckForm
	},
	created() {
		this.getList();
	},
	data() {
		return {
			queryForm: {
        authNo: '',
        // checkUser: '',
        leaderUserId: '',
        status: '',
        dateRange: []
      },
			list: [
				// {
				// 	authNo: 'CK20250001',
				// 	reviewContent: '门禁权限申请',
				// 	createTime: '2025-01-15 10:00:00',
				// 	// checkUser: '张三',
				// 	reviewState: '0', // 0:待审核
				// 	leaderUserId: '李四'
				// },
				// {
				// 	authNo: 'CK20250002',
				// 	reviewContent: '门禁卡挂失申请',
				// 	createTime: '2025-01-16 14:30:00',
				// 	// checkUser: '王五',
				// 	reviewState: '1', // 1:已通过
				// 	leaderUserId: '赵六'
				// },
				// {
				// 	authNo: 'CK20250003',
				// 	reviewContent: '门禁权限变更',
				// 	createTime: '2025-01-17 09:15:00',
				// 	// checkUser: '钱七',
				// 	reviewState: '2', // 2:已驳回
				// 	leaderUserId: '孙八'
				// }
			],
			total: 3,
			loading: false,
			queryParams: {
				pageNo: 1,
				pageSize: 10,
			},
			checkStateDictDatas: getDictDatas(DICT_TYPE.NACS_CHECK_STATE),
			activeRow: null  // 当前展开行的id
		}
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
				console.log(res.data)
				// 处理返回的数据
        const detailData = {
					authMode: res.data[0].authMode,
					cardNo: res.data[0].cardNo,
					createTime: row.createTime, // 保持原有分页数据
					idCard: res.data[0].idCard,
					lineNo: res.data[0].lineNo,
					timePeriodId: res.data[0].timePeriodId,
					// 合并group和device信息
					groupName: res.data.map(item => item.groupName).filter(Boolean).join('、'),
					groupCode: res.data.map(item => item.groupCode).filter(Boolean).join('、'),
					deviceName: res.data.map(item => item.deviceName).filter(Boolean).join('、'),
					deviceCode: res.data.map(item => item.deviceCode).filter(Boolean).join('、')
        };
				// 合并详情数据到当前行
				this.list = this.list.map(item => {
					if (item.authNo === row.authNo) {
						return { 
							...item,
							...detailData
						};
					}
					return item;
				});
				console.log(this.list)
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
		handleRowClick(row) {
			if (this.activeRow === row.authNo) {
				this.activeRow = null;
			} else {
				this.activeRow = row.authNo;
			}
		},
		/** 审核按钮操作 */
		handleCheck(row) {
			this.$refs["formRef"].open(row);
			this.getList();
		}
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
		padding: 40px 40px;
		background: #f8fafc;
		border-top: 1px solid #ebeef5;
		max-height: 400px;
  	overflow-y: auto;
		margin: 0;

		.detail-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 30px;
			padding-bottom: 15px;
			min-height: 120px;

			.detail-column {
				display: flex;
				flex-direction: column;
				gap: 15px;
			}

			.full-width {
				grid-column: 1 / -1;
				border-top: 1px dashed #e4e7ed;
				padding-top: 15px;
			}
		}

		.detail-item {
			display: flex;
			align-items: center;
			font-size: 14px;

			label {
				color: #909399;
				min-width: 80px;
				margin-right: 10px;
			}

			span {
				color: #606266;
				&.highlight {
					color: #409EFF;
					font-weight: 500;
				}
			}
		}

		.detail-section {
			h4 {
				color: #303133;
				margin: 0 0 10px 0;
				font-size: 14px;
				display: flex;
				align-items: center;

				i {
					margin-right: 8px;
					color: #909399;
				}
			}

			.remark-text {
				color: #666;
				line-height: 1.6;
				margin: 0;
				padding: 10px;
				background: #fff;
				border-radius: 4px;
			}
		}
	}
}
::v-deep .el-table__expanded-cell {
	padding: 0px !important;
}
</style>