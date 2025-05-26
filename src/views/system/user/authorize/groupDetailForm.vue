<template>
	<div>
		<el-drawer
      :visible.sync="groupDetailDrawerVisible"
      direction="rtl"
      size="50%"
      :modal="true"
      :append-to-body="true"
      :modal-append-to-body="false"
      :destroy-on-close="true"
			title="门禁点列表">
      <el-table :data="accessPointList" style="width: calc(100% - 60px)">
        <el-table-column prop="deviceName" label="门禁点名称" align="center" />
        <el-table-column prop="deviceCode" label="设备编号" align="center" />
        <el-table-column prop="lineNo" label="线路ID" align="center" />
        <el-table-column prop="groupCode" label="权限组编码" align="center" />
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                  @pagination="getList"/>
    </el-drawer>
	</div>
</template>
<script>
import * as groupsApi from "@/api/nacs/d_groups/index";
export default {
	name: "groupDetailForm",
	data() {
		return {
			groupDetailDrawerVisible: false,
			accessPointList: [],
			total: 0,
			queryParams: {
				pageNo: 1,
				pageSize: 10,
				code: null,
			}
		}
	},
	methods: {
		/** 查询列表 */
    async getList() {
      try {
        this.loading = true
        const response = await groupsApi.getGroupEquipList(this.queryParams);
        this.accessPointList = response.data.list;
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    /** 显示权限组详情 */
    async showGroupDetails(row) {
      this.currentGroup = row;
      this.groupDetailDrawerVisible = true;
      await this.getAccessPoints(row.code); // 使用groupCode作为查询条件
    },
    /** 获取门禁点列表 */
    async getAccessPoints(groupCode) {
      try {
        this.loading = true;
        this.queryParams.code = groupCode
        this.getList()
      } catch (error) {
        console.error('获取门禁点列表失败', error);
        this.$modal.msgError('获取门禁点列表失败');
      } finally {
        this.loading = false;
      }
    },
	}
}
</script>
<style lang="scss" scoped>
	.el-table {
		margin-left: 30px;
		margin-right:30px;
		margin-bottom: 60px;
		margin-top: 40px;
	}
</style>