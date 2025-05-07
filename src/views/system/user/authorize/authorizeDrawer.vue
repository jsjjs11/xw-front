<template>
  <div>
    <!-- 人员授权抽屉 -->
    <el-drawer
      title="人员授权"
      :visible.sync="authDrawerVisible"
      direction="rtl"
      size="80%"
      :modal="true"
      :append-to-body="true"
      :modal-append-to-body="false"
      :destroy-on-close="true">
      <div>
        <el-form ref="form" :model="formData"  label-width="120px">
        <el-form-item label="线路选择" prop="lineNo">
          <el-select v-model="formData.lineNo" placeholder="请选择线路" @change="handleLineChange" >
            <el-option
              v-for="line in lineMap"
              :key="parseInt(line.id)"
              :label="line.name"
              :value="line.lineNo"
            />
          </el-select>
        </el-form-item>
        </el-form>
      </div>
      <div style="text-align: center">
      <el-transfer
        style="text-align: left; display: inline-block"
        v-model="value4"
        filterable
        :left-default-checked="[]"
        :right-default-checked="[]"
        :titles="['可选门禁点', '已选门禁点']"
        :button-texts="['到左边', '到右边']"
        :format="{
        noChecked: '${total}',
        hasChecked: '${checked}/${total}'
      }"
        @change="handleChange"
        :data="data"
        class="custom-transfer">

      </el-transfer>
      </div>
      <div class="drawer-footer">
        <el-button @click="authDrawerVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAuthConfirm">确 定</el-button>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import { getLineDatas } from '@/utils/dict'
export default {
  name: 'AuthorizeDrawer',
  data() {
    return {
      formData:{
        lineNo:''
      },
      lineMap: getLineDatas(),
      authDrawerVisible:false
    }
  },
  methods: {
    /** 显示授权抽屉 */
    showAuthDrawer() {
      this.authDrawerVisible = true;
      //this.getLeftTableData();
    },
    /** 确认授权 */
    handleAuthConfirm() {
      // TODO: 实现确认授权逻辑
      this.authDrawerVisible = false;
    }
  }
}
</script>

<style scoped>
.custom-transfer {
  width: calc(100% - 100px);
  height: calc(100vh - 210px);
}
.custom-transfer ::v-deep .el-transfer-panel {
  width: 40%;
  height: 100%;
}


.auth-drawer-content {
  text-align: center;
}

.search-item .label {
  width: 80px;
  text-align: right;
  margin-right: 8px;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  text-align: right;
  border-top: 1px solid #e8e8e8;
}

::v-deep .el-drawer__body {
  height: 100%;
  overflow: hidden;
}

::v-deep .el-table {
  flex: 1;
  overflow: auto;
}
</style>
