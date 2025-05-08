<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="110px">
      <el-form-item label="线路ID" prop="lineId" >
        <el-input v-model="queryParams.lineId" placeholder="请输入线路ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <!-- <el-form-item label="物理卡号" prop="cardId">
        <el-input v-model="queryParams.cardId" placeholder="请输入物理卡号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item> -->
      <!-- <el-form-item label="虚拟卡号" prop="cardMapBcd">
        <el-input v-model="queryParams.cardMapBcd" placeholder="请输入虚拟卡号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item> -->
      <el-form-item label="卡号" prop="cardNo">
        <el-input v-model="queryParams.cardNo" placeholder="请输入卡号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <!-- <el-form-item label="持卡人ID" prop="employeeId">
        <el-input v-model="queryParams.employeeId" placeholder="请输入持卡人ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item> -->
      <el-form-item label="持卡人编号ID" prop="employeeCode">
        <el-input v-model="queryParams.employeeCode" placeholder="请输入持卡人编号ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <!-- <el-form-item label="持卡人姓名" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入持卡人姓名" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item> -->
      <el-form-item label="持卡人身份证号" prop="idCard">
        <el-input v-model="queryParams.idCard" placeholder="请输入持卡人身份证号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="卡类型" prop="cardType">
        <el-select v-model="queryParams.cardType" placeholder="请选择卡类型" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.NACS_CARD_TYPE)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="卡状态" prop="cardState">
        <el-select v-model="queryParams.cardState" placeholder="请选择卡状态" clearable size="small">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.NACS_CARD_STATE)"
                       :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
<!--      <el-col :span="1.5">-->
<!--        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="openForm(undefined)"-->
<!--                   v-hasPermi="['nacs:cards:create']">新增</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['nacs:cards:export']">导出</el-button>
      </el-col>
              <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="线路ID" align="center" prop="lineId" />
      <!-- <el-table-column label="物理卡号" align="center" prop="cardId" /> -->
      <!-- <el-table-column label="虚拟卡号" align="center" prop="cardMapBcd" /> -->
      <el-table-column label="卡号" align="center" prop="cardNo" />
      <!-- <el-table-column label="持卡人ID" align="center" prop="employeeId" /> -->
      <el-table-column label="持卡人编号ID" align="center" prop="employeeCode" />
      <!-- <el-table-column label="持卡人姓名" align="center" prop="employeeName" /> -->
      <el-table-column label="持卡人身份证号" align="center" prop="idCard" />
      <el-table-column label="卡类型" align="center" prop="cardType">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.NACS_CARD_TYPE" :value="scope.row.cardType" />
        </template>
      </el-table-column>
      <el-table-column label="卡状态" align="center" prop="cardState">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.NACS_CARD_STATE" :value="scope.row.cardState" />
        </template>
      </el-table-column>
      <el-table-column label="有效时间" align="center" prop="startDate" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.startDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="失效时间" align="center" prop="endDate" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.endDate) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="openForm(scope.row.id)"
                     v-hasPermi="['nacs:cards:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['nacs:cards:delete']">注销</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
    <!-- 对话框(添加 / 修改) -->
    <CardsForm ref="formRef" @success="getList" />
    </div>
</template>

<script>
import * as CardsApi from '@/api/nacs/cards';
import CardsForm from './CardsForm.vue';
export default {
  name: "Cards",
  components: {
          CardsForm,
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
      // 门禁卡片管理列表
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
        lineId: null,
        cardId: null,
        // cardMapBcd: null,
        cardNo: null,
        // employeeId: null,
        employeeCode: null,
        // employeeName: null,
        idCard: null,
        cardType: null,
        cardState: null,
      },
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
        const res = await CardsApi.getCardsPage(this.queryParams);
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
      await this.$modal.confirm('是否确认注销门禁卡片管理编号为"' + id + '"的数据项?')
      try {
       await CardsApi.cancelCards(id);
       await this.getList();
       this.$modal.msgSuccess("注销成功");
      } catch {}
    },
    /** 导出按钮操作 */
    async handleExport() {
      await this.$modal.confirm('是否确认导出所有门禁卡片管理数据项?');
      try {
        this.exportLoading = true;
        const data = await CardsApi.exportCardsExcel(this.queryParams);
        this.$download.excel(data, '门禁卡片管理.xls');
      } catch {
      } finally {
        this.exportLoading = false;
      }
    },
              }
};
</script>
