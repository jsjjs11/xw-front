<template>
  <div class="drawer-content">
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
        v-model="value"
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
      authDrawerVisible:false,
      data:[], // 传输组件数据源
      value: [], // 已选中的门禁点ID数组
      loading: false // 加载状态
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
    },
    /** 处理线路选择 */
    handleLineChange(value) {
      this.formData.lineNo = value;
      this.getLeftTableData();
    },
    handleChange(value, direction, movedKeys) {
      console.log('传输变化:', value, direction, movedKeys);
      // 可以根据方向(direction: 'left'或'right')处理不同的逻辑
      if (direction === 'right') {
        // 从左侧移动到右侧(新增授权)
        this.$message.success(`已添加 ${movedKeys.length} 个门禁点授权`);
      } else if (direction === 'left') {
        // 从右侧移动到左侧(取消授权)
        this.$message.warning(`已移除 ${movedKeys.length} 个门禁点授权`);
      }
    },
    /** 获取左侧表格数据 */
    getLeftTableData() {
      if(!this.formData.lineNo){
        this.$message.error('请选择线路');
        return;
      }
      try {
        this.loading = true;
        // 模拟数据
        const mockData = {
          'L00001': [ // 线路1
            { key: '101', label: '线路1-门禁点1' },
            { key: '102', label: '线路1-门禁点2' },
            { key: '103', label: '线路1-门禁点3' },
          ],
          'L00002': [ // 线路2
            { key: '201', label: '线路2-门禁点1' },
            { key: '202', label: '线路2-门禁点2' },
            { key: '203', label: '线路2-门禁点3' },
            { key: '204', label: '线路2-门禁点4' },
          ],
          'L00003': [ // 线路3
            { key: '301', label: '线路3-门禁点1' },
            { key: '302', label: '线路3-门禁点2' },
          ]
        };
        console.log(this.formData.lineNo)
        this.data = mockData[this.formData.lineNo] || [];
      } catch (error) {
        console.error('获取门禁点数据失败', error);
        this.$message.error('获取门禁点数据失败');
      } finally {
        this.loading = false;
      }
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
