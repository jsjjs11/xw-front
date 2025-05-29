<template>
  <div class="app-container">
    <el-row :gutter="20" class="full-height">
      <!--门禁组数据-->
      <el-col :span="4" :xs="24" class="tree-container">
        <div class="head-container">
          <el-input v-model="groupName" placeholder="请输入门禁组名称" clearable size="small" prefix-icon="el-icon-search"
            style="margin-bottom: 20px" />
        </div>
        <div class="tree-wrapper">
          <el-tree :data="groupsOptions" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" default-expand-all highlight-current
            @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--门禁点数据-->
      <el-col :span="20" :xs="24" class="content-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
          label-width="100px">
          <el-form-item label="门禁点名称" prop="deviceName">
            <el-input v-model="queryParams.deviceName" placeholder="请输入门禁点名称" clearable style="width: 240px"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="门禁访问类型" prop="accessType">
            <el-select v-model="queryParams.accessType" placeholder="请选择用户类型" clearable>
              <el-option v-for="dict in this.getDictDatas(DICT_TYPE.NACS_ACCESS_TYPE)" :key="dict.value"
                :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="table-container">
          <el-table v-loading="loading" :data="deviceList">
            <el-table-column label="门禁点编号" align="center" key="id" prop="id" />
            <el-table-column label="门禁点名称" align="center" key="deviceName" prop="deviceName"
              :show-overflow-tooltip="true" />
            <el-table-column label="线路名称" align="center" key="lineNo" prop="lineNo" :show-overflow-tooltip="true">
              <template v-slot="scope">
                <span>{{lineList.find(line => line.lineNo === scope.row.lineNo).name}}</span>
              </template>
            </el-table-column>
            <el-table-column label="门禁组编号" align="center" key="groupCode" prop="groupCode"
              :show-overflow-tooltip="true" />
            <el-table-column label="访问类型" align="center" key="accessType" prop="accessType" width="120">


              <template v-slot="scope">
                <el-tag>{{getDictDataLabel(DICT_TYPE.NACS_ACCESS_TYPE,scope.row.accessType)}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" width="160">
              <template v-slot="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo"
              :limit.sync="queryParams.pageSize" @pagination="getList" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import { getGroups,getGroupEquipList } from "@/api/nacs/d_groups/index";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getLineDatas } from "@/utils/dict";
export default {
  name: "DGroup",
  components: { Treeselect },
  data() {
    return {
      lineList: getLineDatas(),
      // 遮罩层
      loading: true,

      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      deviceList: null,

      // 门禁组树选项
      groupsOptions: undefined,

      // 门禁组名称
      groupName: undefined,
      defaultProps: {
        children: "children",
        label: "name"
      },
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        lineNo: undefined,
        groupCode: undefined,
        groupName: undefined,
        accessType:undefined,
        code:undefined,
      }
    };
  },
  watch: {
    // 根据名称筛选部门树
    groupName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
  },
  methods: {
    getList() {
      this.loading = true;
      getGroupEquipList(this.queryParams).then(response => {
        console.log(response)
          this.deviceList = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    getTreeselect() {
      getGroups().then(response => {
        this.groupsOptions = [];
        this.groupsOptions.push(...this.handleTree(response.data, "id",'','','0'));
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams = {
        pageNo: 1,
        pageSize: 10,
        lineNo: undefined,
        groupCode: undefined,
        groupName: undefined,
        code: undefined
      };
      console.log(data)
      if(data.type=='group'){
        this.queryParams.code = data.code;
        this.queryParams.lineNo = data.parentId;

      }else if(data.type=='line'){
        this.queryParams.lineNo = data.lineNo;
      }

      this.getList();
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

  }
};
</script>
<style scoped>
.full-height {
  height: 100%;
}

.tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.el-tree {
  min-height: 100%;
}

.content-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
::v-deep(.el-table) {
  flex: 1;
  overflow-y: auto;
}
.pagination-container {
  height: 50px;
}
</style>
