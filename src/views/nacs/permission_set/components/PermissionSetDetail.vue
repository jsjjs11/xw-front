<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="线路名称" prop="lineNo">
      <el-select v-model="queryParams.lineNo"  multiple  placeholder="请选择线路" >
        <el-option
          v-for="line in lineList"
          :key="parseInt(line.id)"
          :label="line.name"
          :value="line.lineNo"
        />
      </el-select>
      </el-form-item>
      <el-form-item label="门禁设备名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入门禁设备名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-if="list.length==0" type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['nacs:permission-set-detail:create']">新增</el-button>
        <el-button v-else type="primary" plain icon="el-icon-edit" size="mini" @click="handleAdd"
                   v-hasPermi="['nacs:permission-set-detail:edit']">修改</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
<!--      <el-table-column label="编号" align="center" prop="id" />-->

      <el-table-column prop="lineNo"  align="center"  label="线路名称">
        <template v-slot="scope">
          <span>{{lineList.find(line => line.lineNo === scope.row.lineNo).name}}</span>
        </template>
      </el-table-column>

      <el-table-column label="设备名称" align="center" prop="name" />
      <el-table-column label="设备编号" align="center" prop="code" />
      <el-table-column label="授权模式" align="center" prop="authMode">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.NACS_AUTH_MODE" :value="scope.row.authMode" />
        </template>
      </el-table-column>
      <el-table-column label="区域集合ID" align="center" prop="setCode" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 对话框(添加 / 修改) -->
    <PermissionSetDetailForm ref="formRef" :set-code="setCode" :selected-list="list" @success="getList" />
<!--    <TreeTransfer ref="TreeTransferRef"  />-->
  </div>
</template>

<script>
import { getPermissionSetDetailPage, deletePermissionSetDetail } from '@/api/nacs/permission_set/index.js'
import PermissionSetDetailForm from './PermissionSetDetailForm.vue'
// import TreeTransfer from './TreeTransfer.vue'
import {getLineDatas} from "@/utils/dict";
export default {
  name: "PermissionSetDetail",
  components: { PermissionSetDetailForm },
  props:[
    'setCode'
  ],// 集合编号（主表的关联字段）
  data() {
    return {
      // 遮罩层
      loading: true,

      lineList: getLineDatas(),
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 权限集详情列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        lineNo: null,
        name:null,
        authMode: null,
        setCode: null
      }
    }
  },
  watch:{/** 监听主表的关联字段的变化，加载对应的子表数据 */
    setCode:{
      handler(val) {
        this.queryParams.setCode = val;
        if (val){
          this.handleQuery();
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.setCode){
      this.queryParams.setCode = this.setCode;
      this.getList()
    }

  },
  methods: {
    /** 查询列表 */
    async getList() {

      try {
        //this.queryParams.lineNo =JSON.stringify(this.queryParams.lineNo);
        let res = await getPermissionSetDetailPage(this.queryParams);
        this.loading = true
        this.list = res.data.list
        this.total = res.data.total
      } finally {
        this.loading = false
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.$refs["formRef"].open()

    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除权限集详情编号为"' + id + '"的数据项?').then(() => {
        return deletePermissionSetDetail(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    }
  }
}
</script>
