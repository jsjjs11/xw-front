<template>
  <div class="app-container">
    <div class="full-size">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="110px">
      <el-form-item label="卡号" prop="cardNo">
        <el-input v-model="queryParams.cardNo" placeholder="请输入卡号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="持卡人编号ID" prop="employeeCode">
        <el-input v-model="queryParams.employeeCode" placeholder="请输入持卡人编号ID" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="持卡人姓名" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入持卡人姓名" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
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

      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['nacs:cards:export']">导出</el-button>
      </el-col>
              <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading"
              :data="list"
              :stripe="true"
              :show-overflow-tooltip="true"
              height="calc(100vh - 300px)"
              @expand-change="handleExpandChange"
              ref="table">
      <el-table-column type="expand" width="60">
        <template slot-scope="scope">
          <div class="line-card-container">
            <h4 v-if="lineCardslength > 0">线路侧卡片信息</h4>
            <p v-else>暂无线路侧卡片信息</p>
            <el-table
              :data="scope.row.lineCard"
              border
              style="width: 100%"
              v-loading="loadinglineCard"
              :row-key="row => row.id">
              <el-table-column prop="lineCardNo" align="center" label="线路侧卡号"></el-table-column>
              <el-table-column prop="lineName" align="center" label="线路名称">
                <template v-slot="scope">
                  <span>{{ lineMap.find(line => line.lineNo === scope.row.lineNo)?.name }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="lineCardStatus" align="center" label="卡状态">
                <template v-slot="scope">
                  <dict-tag :type="DICT_TYPE.NACS_CARD_STATE" :value="scope.row.lineCardStatus" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="卡号" align="center" prop="cardNo" />
      <!-- <el-table-column label="持卡人ID" align="center" prop="employeeId" /> -->
      <el-table-column label="持卡人编号ID" align="center" prop="employeeCode" />
      <el-table-column label="持卡人姓名" align="center" prop="employeeName" />
      <el-table-column label="持卡人身份证号" align="center" prop="idCard" />
      <el-table-column label="卡片来源" align="center" prop="cardSource">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.NACS_DATA_SOURCE" :value="scope.row.cardSource" />
        </template>
      </el-table-column>
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
      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="openForm(scope.row.id)"
                     v-hasPermi="['nacs:cards:update']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['nacs:cards:delete']">注销</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    <!-- 分页组件 -->
     <div class="pagination-container">
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.current" :limit.sync="queryParams.size"
                @pagination="getList"/>
    </div>

    </div>
    <!-- 对话框(添加 / 修改) -->
    <CardsForm ref="formRef" @success="getList" />
    </div>
</template>

<script>
import * as CardsApi from '@/api/nacs/cards';
import { DICT_TYPE, getLineDatas } from '@/utils/dict'
import CardsForm from './CardsForm.vue';
export default {
  name: "Cards",
  components: {
          CardsForm,
  },
  data() {
    return {
      lineMap: getLineDatas(),
      lineCardslength: 0,
      // lineList: getLineDatas(),
      // 遮罩层
      loading: true,
      loadinglineCard: false,
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
        current: 1,
        size: 10,
        lineId: null,
        cardId: null,
        // cardMapBcd: null,
        cardNo: null,
        // employeeId: null,
        employeeCode: null,
        employeeName: null,
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
    /** 处理展开行变化 */
    async handleExpandChange(row, expandedRows) {
      if (expandedRows.length > 0 && row) {
        this.loadinglineCard = true;
        try {
          await this.loadLineCard(row);
          // 确保数据加载完成后再设置展开状态
          // this.$nextTick(() => {
          //   this.$refs.table.toggleRowExpansion(row, true);
          // });
        } catch (error) {
          console.error("加载线路卡失败", error);
        } finally {
          console.log(1111111)
          this.loadinglineCard = false;
        }
      }
    },
    /** 查询线路侧卡片 */
    async loadLineCard(row) {
      try {
        const response = await CardsApi.getLineCards(row.idCard)
        if (response.data) {
          // 将线路卡片信息附加到主卡对象
          if ( this.list.length > 0) {
            this.list.forEach(card => {
              if (card.idCard === row.idCard) {
                card.lineCard = response.data;
                this.lineCardslength = (response.data).length;
              }
            });
          }
        }
      } catch (error) {
        console.error("获取线路侧卡片失败", error);
      }
    },
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
<style scoped lang="scss">
.full-size {
  display: flex;
  flex-direction: column;
  height: 100%;
}
::v-deep(.el-table) {
  flex: 1;
  overflow-y: auto;
}
.pagination-container {
  height: 50px;
}

.line-card-container {
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin: 10px 0;
}

::v-deep .line-card-container .el-table {
  max-height: 300px;
  tr {
    overflow-y: auto !important;
  }
}

.line-card-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.line-card-container h4 {
  margin-bottom: 15px;
  color: #606266;
}

.no-data-container {
  text-align: center;
  padding: 30px;
  color: #909399;
  font-size: 14px;
}

</style>
