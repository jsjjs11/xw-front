<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
      <el-form-item label="线路编号" prop="lineNo">
        <el-input v-model="queryParams.lineNo" placeholder="请输入线路编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="线路名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入线路名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="线路颜色" prop="color">
        <el-color-picker v-model="queryParams.color" show-alpha :predefine="predefineColors" class="custom-color-picker"
              clearable @keyup.enter.native="handleQuery"></el-color-picker>
        <!-- <el-input v-model="queryParams.color" placeholder="请输入线路颜色" clearable @keyup.enter.native="handleQuery"/> -->
      </el-form-item>
      <el-form-item label="负责人用户ID" prop="leaderUserId">
        <el-input v-model="queryParams.leaderUserId" placeholder="请输入负责人用户ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="queryParams.remark" placeholder="请输入备注" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openForm(undefined)"
                   v-hasPermi="['nacs:lines:create']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['nacs:lines:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="线路编号" align="center" prop="lineNo" />
      <el-table-column label="线路名称" align="center" prop="name" />
      <el-table-column label="线路颜色" align="center" prop="color" >
        <template v-slot="scope">
          <el-tag
            :color=scope.row.color
           >
          </el-tag>



        </template>
      </el-table-column>
      <el-table-column label="负责人用户ID" align="center" prop="leaderUserId" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="openForm(scope.row.id)"
                     v-hasPermi="['nacs:lines:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['nacs:lines:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <LinesForm ref="formRef" @success="getList" />
    </div>
</template>

<script>
import * as LinesApi from '@/api/nacs/line';
import LinesForm from './LinesForm.vue';
export default {
  name: "Lines",
  components: {
          LinesForm,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
              // 总条数
        total: 0,
      // 线路信息列表
      list: [],
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 选中行
      currentRow: {},
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        lineNo: null,
        name: null,
        color: null,
        leaderUserId: null,
        remark: null,
        createTime: [],
      },
      predefineColors: [
				'#ff4500',
				'#ff8c00',
				'#ffd700',
				'#90ee90',
				'#00ced1',
				'#1e90ff',
				'#c71585',
				'rgba(255, 69, 0, 0.68)',
				'rgb(255, 120, 0)',
				'hsv(51, 100, 98)',
				'hsva(120, 40, 94, 0.5)',
				'hsl(181, 100%, 37%)',
				'hsla(209, 100%, 56%, 0.73)',
				'#c7158577'
			],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    async getList() {
      try {
      this.loading = true;
        const res = await LinesApi.getLinesPage(this.queryParams);
        this.list = res.data.list;
        this.total = res.data.total;
      } finally {
        this.loading = false;
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 添加/修改操作 */
    openForm(id) {
      this.$refs["formRef"].open(id);
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      const id = row.id;
      await this.$modal.confirm('是否确认删除线路信息编号为"' + id + '"的数据项?')
      try {
       await LinesApi.deleteLines(id);
       await this.getList();
       this.$modal.msgSuccess("删除成功");
      } catch {}
    },
    /** 导出按钮操作 */
    async handleExport() {
      await this.$modal.confirm('是否确认导出所有线路信息数据项?');
      try {
        this.exportLoading = true;
        const data = await LinesApi.exportLinesExcel(this.queryParams);
        this.$download.excel(data, '线路信息.xls');
      } catch {
      } finally {
        this.exportLoading = false;
      }
    },
  }
};
</script>
<style lang="scss" scoped>
  ::v-deep .custom-color-picker .el-color-picker__trigger {
  width: 200px !important;
}
</style>
