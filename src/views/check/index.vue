<template>
	<div class="app-container">
		<el-row :gutter="20">
			<el-col :span="20" >
				<!-- 查询表单 -->
				<el-form :inline="true" :model="queryForm" size="small" ref="queryForm" class="search-form">
					<el-form-item label="审核单号">
						<el-input v-model="queryForm.checkId" placeholder="请输入审核单号"></el-input>
					</el-form-item>
					<el-form-item label="发起人">
						<el-input v-model="queryForm.checkUser" placeholder="请输入发起人"></el-input>
					</el-form-item>
					<el-form-item label="负责人">
						<el-input v-model="queryForm.checkLeader" placeholder="请输入负责人"></el-input>
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
			<el-table :data="list" style="width: 100%; height: 655px;" v-loading="loading" :stripe="true" :show-overflow-tooltip="true">
				<el-table-column type="selection" width="45" align="center" :reserve-selection="true"></el-table-column>
				<el-table-column type="index" width="40" align="center" />
				<el-table-column label="审核单号" align="center" prop="checkId"></el-table-column>
				<el-table-column label="审核内容" align="center" prop="checkContent"></el-table-column>
				<el-table-column label="发起时间" align="center" prop="checkTime"></el-table-column>
				<el-table-column label="发起人" align="center" prop="checkUser"></el-table-column>
				<el-table-column label="审核状态" align="center" prop="checkStatus">
					<template slot-scope="scope">
						<dict-tag :type="DICT_TYPE.NACS_CHECK_STATE" :value="scope.row.checkStatus"/>
					</template>
				</el-table-column>
				<el-table-column label="负责人" align="center" prop="checkLeader"></el-table-column>
				<el-table-column label="操作" align="center" width="150">
					<template slot-scope="scope">
						<el-button type="text" @click="handleView(scope.$index)">详情</el-button>
						<el-button type="text" 
						:disabled="scope.row.checkStatus !== '0'"
						@click="handleCheck(scope.$index)"
						v-hasPermi="['nacs:authorize:check']">{{scope.row.checkStatus === '0' ? '审核' : '已处理'}}</el-button>
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
        checkId: '',
        checkUser: '',
        checkLeader: '',
        status: '',
        dateRange: []
      },
			list: [
				{
					checkId: 'CK20250001',
					checkContent: '门禁权限申请',
					checkTime: '2025-01-15 10:00:00',
					checkUser: '张三',
					checkStatus: '0', // 0:待审核
					checkLeader: '李四'
				},
				{
					checkId: 'CK20250002',
					checkContent: '门禁卡挂失申请',
					checkTime: '2025-01-16 14:30:00',
					checkUser: '王五',
					checkStatus: '1', // 1:已通过
					checkLeader: '赵六'
				},
				{
					checkId: 'CK20250003',
					checkContent: '门禁权限变更',
					checkTime: '2025-01-17 09:15:00',
					checkUser: '钱七',
					checkStatus: '2', // 2:已驳回
					checkLeader: '孙八'
				}
			],
			total: 3,
			loading: false,
			queryParams: {
				pageNo: 1,
				pageSize: 10,
				periodName: ''
			},
			checkStateDictDatas: getDictDatas(DICT_TYPE.NACS_CHECK_STATE)
		}
	},
	methods: {
		/** 查询列表 */
    async getList() {
      try {
      	this.loading = true;
				const res = await CheckApi.getCheckPage(this.queryParams);
				this.list = res.data.list;
				this.total = res.data.total;
      } finally {
        this.loading = false;
      }
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
				this.loading = true;
				// 调用API获取详情数据
				const res = await CheckApi.getCheckDetail(row.checkId);
				
				// 构建详情内容HTML
				const detailContent = `
					<div style="line-height: 30px;">
						<p><strong>审核单号：</strong>${res.data.checkId}</p>
						<p><strong>申请人：</strong>${res.data.applyUser}</p>
						<p><strong>申请时间：</strong>${res.data.applyTime}</p>
						<p><strong>门禁卡号：</strong>${res.data.cardId}</p>
						<p><strong>线路名称：</strong>${res.data.lineName}</p>
						<p><strong>权限类型：</strong>${res.data.accessType}</p>
						<p><strong>权限内容：</strong>${res.data.accessContent}</p>
					</div>
				`;
				
				this.$alert(detailContent, '审核详情', {
					dangerouslyUseHTMLString: true,
					customClass: 'detail-dialog',
					confirmButtonText: '确定'
				});
			} catch (error) {
				console.error("获取详情失败", error);
				this.$modal.msgError("获取详情失败");
			} finally {
				this.loading = false;
			}
		},
		/** 审核按钮操作 */
		handleCheck(id) {
			this.$refs["formRef"].open(id);
		}
	}
}
</script>