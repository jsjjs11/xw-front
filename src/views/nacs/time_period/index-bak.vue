<template>
	<div class="app-container">
		<div class="search-container">
			<span style="font-size: 14px;">时间组名称</span>
			<el-input 
				v-model="periodName" 
				placeholder="请输入时间组名称" 
				style="width: 200px; margin-right: 10px;"></el-input>
			<el-button type="primary" @click="handleSearch" icon="el-icon-search" size="small">查询</el-button>
			<el-button type="primary" @click="handleReset" icon="el-icon-refresh" size="small">重置</el-button>
		</div>
		<div class="operation-container">
			<el-row :gutter="10" class="mb8">
				<el-col :span="1.5">
					<el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openForm(undefined)"
										v-hasPermi="['nacs:time_period:create']">新增</el-button>
				</el-col>
					<right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
			</el-row>
		</div>
		<div class="table-container">
			<el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
				<el-table-column type="selection" width="45" align="center" />
				<el-table-column label="编号" align="center" key="id" prop="id" />
				<el-table-column label="时间组名称" align="center" key="periodName" prop="periodName" />
				<el-table-column label="状态" align="center" key="status" prop="status">
					<template v-slot="scope">
              <el-switch v-model="scope.row.status" :active-value="0" :inactive-value="1" @change="handleStatusChange(scope.row)" />
            </template>
				</el-table-column>
				<el-table-column label="创建人" align="center" key="creator" prop="creator" />
				<el-table-column label="创建时间" align="center" key="createTime" prop="createTime" >
					<template v-slot="scope">
						<span>{{ parseTime(scope.row.createTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column label="更新人" align="center" key="updater" prop="updater" />
				<el-table-column label="更新时间" align="center" key="updateTime" prop="updateTime" >
					<template v-slot="scope">
						<span>{{ parseTime(scope.row.updateTime) }}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作状态" align="center" key="op_state" prop="op_state" />
				<el-table-column label="操作" align="center" class-name="small-padding fixed-width">
					<template v-slot="scope">
						<el-button size="mini" type="text" icon="el-icon-edit" @click="openForm(scope.row.id)"
											v-hasPermi="['nacs:time_period:update']">修改</el-button>
						<el-button size="mini" type="text" icon="el-icon-view" @click="checkForm(scope.row.id)">查看</el-button>					
						<el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
											v-hasPermi="['nacs:time_period:delete']">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
				@pagination="getList"/>
		</div>
		<TimeForm ref="timeForm" @success="getList"></TimeForm>
	</div>
</template>
<script>
import * as TimeApi from '@/api/nacs/time_period';
import TimeForm  from './TimeForm.vue';
export default {
	name: 'TimePeriod',
	components: {
		TimeForm,
	},
	data() {
		return {
			list: [],
			total: 0,
			periodName: '',
			showSearch: false,
			loading: false,
			queryParams: {
				pageNo: 1,
				pageSize: 10,
				periodName: ''
			},
			
		}
	},
	created() {
    this.getList();
  },
	methods: {
		/** 查询列表 */
    async getList() {
      try {
      	this.loading = true;
				const res = await TimeApi.getTimePeriodPage(this.queryParams);
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
		openForm(id) {
			this.$refs['timeForm'].openForm(id);
		},
		checkForm(id) {
			this.$refs['timeForm'].checkForm(id);
		},
		handleDelete(row) {
			this.$confirm('确认删除该时间段吗？').then(() => {
				TimeApi.deleteTimePeriod(row.id).then(() => {
					this.$message.success('删除成功');
					this.getList();
				}).catch(() => {
					this.$message.error('删除失败');
				});
			}).catch(() => {
			});
		},
		// 时间段状态修改
    handleStatusChange(row) {
      let text = row.status === CommonStatusEnum.ENABLE ? "正常" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.periodName + '"时间段吗?').then(function() {
				return changeUserStatus(row.id, row.status);
			}).then(() => {
				this.$modal.msgSuccess(text + "成功");
			}).catch(function() {
				row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE
						: CommonStatusEnum.ENABLE;
			});
    },
	}
}
</script>
<style lang="scss" scoped>
.search-container {
	margin-bottom: 15px; 
	display: flex; 
	align-items: center; 
	gap: 10px;
}
.table-container {
	padding: 15px 0px 0px 0px;
}
</style>