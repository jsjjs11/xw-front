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
          <el-row>
            <el-col :span="5">
              <el-form-item label="权限模式" prop="authMode">
                <el-select v-model="formData.authMode" placeholder="请选择权限模式" @change="handleAuthModeChange">
                  <el-option v-for="dict in authModeDictDatas" :key="parseInt(dict.value)" :label="dict.label"
                          :value="parseInt(dict.value)" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="线路选择" prop="lineNo">
                <el-select v-model="formData.lineNo" placeholder="请选择线路" @change="handleLineChange" 
                  :disabled="!isLineSelectEnabled">
                  <el-option
                    v-for="line in lineMap"
                    :key="parseInt(line.id)"
                    :label="line.name"
                    :value="line.lineNo"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div style="text-align: center">
      <el-transfer
        style="text-align: left; display: inline-block;"
        v-model="filteredValue"
        filterable
        :left-default-checked="[]"
        :right-default-checked="[]"
        :titles="['可选门禁', '已选门禁']"
        :button-texts="['到左边', '到右边']"
        :format="{
        noChecked: '${total}',
        hasChecked: '${checked}/${total}'
      }"
        @change="handleChange"
        :data="data"
        class="custom-transfer">
      <!-- :render-content="renderFunc" -->
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
import { getLineDatas, getDictDatas, DICT_TYPE } from '@/utils/dict';
import * as AuthorizationApi from '@/api/nacs/authorize';
export default {
  name: 'AuthorizeDrawer',
  data() {
    return {
      formData:{
        authMode: 0,
        lineNo:''
      },
      lineMap: getLineDatas(),
      authDrawerVisible: false,
      data:[], // 传输组件数据源
      value: [], // 已选中的门禁点ID数组
      loading: false, // 加载状态
      authModeDictDatas: getDictDatas(DICT_TYPE.NACS_AUTH_MODE), // 权限模式字典数据
      isLineSelectEnabled: true, // 是否允许线路选择
      selectedGroups: [], // 已选中的门禁权限组
      selectedPoints: [], // 已选中的门禁点
      selectedCollections: [], // 已选中的门禁集合
      selectedItems: [], // 已选中的门禁项（包含权限组、门禁点、门禁集合）
      AuthorizeForm:{
        idCard: undefined,
        authItems: undefined,
      },
      authItems: [
        {
          authMode: 0,
          groupCode:[],
        },
        {
          authMode: 1,
          deviceCode:[],
        },
        {
          authMode: 2,
          collectionCode:[],
        }
      ],
    }
  },
  computed: {
    // 根据当前权限模式过滤显示的值
    filteredValue: {
      get() {
        // if(this.formData.authMode === 0) { // 门禁权限组模式
        //   return this.selectedItems
        //     .filter(item => item.type === 'group')
        //     .map(item => item.key);
        // } else if(this.formData.authMode === 1) { // 门禁点模式
        //   return this.selectedItems
        //     .filter(item => item.type === 'point')
        //     .map(item => item.key);
        // } else { // 门禁集合模式
        //   return this.selectedCollections.map(item => item.key);
        // }
        if(this.formData.authMode === 0) { // 门禁权限组模式
          return [
            ...this.selectedGroups,
            ...this.selectedCollections.flatMap(collection => 
              collection.children.filter(child => child.authMode === 0).map(child => child.groupCode)
            )
          ];
        } else if(this.formData.authMode === 1) { // 门禁点模式
          return [
            ...this.selectedPoints,
            ...this.selectedCollections.flatMap(collection => 
              collection.children.filter(child => child.authMode === 1).map(child => child.deviceCode)
            )
          ];
        } else { // 门禁集合模式
          return this.selectedCollections.map(item => item.collectionCode);
        }
      },
      set(newValue) {

      }
    }
  },
  methods: {
    /** 显示授权抽屉 */
    showAuthDrawer(data) {
      this.authDrawerVisible = true;
      this.AuthorizeForm.idCard = data;
    },
    /** 确认授权 */
    async handleAuthConfirm() {
      // TODO: 实现确认授权逻辑
      this.authItems[0].groupCode = this.selectedGroups;
      this.authItems[1].deviceCode = this.selectedPoints;
      this.authItems[2].collectionCode = this.selectedCollections.map(item => item.collectionCode);
      const params = {
        idCard: this.AuthorizeForm.idCard,
        authItems: this.authItems,
      };
      console.log('确认授权参数:', params);
      await AuthorizationApi.createCardPermissionsList(params);
      this.$message.success('授权成功');
      this.authDrawerVisible = false;
    },
    /** 处理权限模式选择 */
    handleAuthModeChange(value) {
      this.formData.authMode = value;
      this.isLineSelectEnabled = (value === 0 || value === 1);
      if(!this.isLineSelectEnabled) {
        this.formData.lineNo = '';
        this.data = [];
        this.getLeftTableData();
      }
      if(this.formData.authMode !== 2) {
        this.getLeftTableData();
      }
    },
    /** 处理线路选择 */
    handleLineChange(value) {
      this.formData.lineNo = value;
      this.getLeftTableData();
    },
    handleChange(value, direction, movedKeys) {
      console.log('传输变化:', value, direction, movedKeys);
      if (!movedKeys || movedKeys.length === 0) return;
      // 根据方向(direction: 'left'或'right')处理不同的逻辑
      // if (direction === 'right') {
      //   // 从左侧移动到右侧(新增授权)
      //   const movedItems = this.data.filter(item => movedKeys.includes(item.key));
        
      //   if(this.formData.authMode === 2) { // 门禁集合模式
      //     this.selectedCollections = [...this.selectedCollections, ...movedItems];
      //     // 提取集合中的所有子项
      //     const allItems = movedItems.reduce((acc, collection) => {
      //       return [...acc, ...collection.children];
      //     }, []);
      //     this.selectedItems = [...this.selectedItems, ...allItems];
      //   } else {
      //     this.selectedItems = [...this.selectedItems, ...movedItems];
      //   }
        
      //   this.$message.success(`已添加 ${movedKeys.length} 个授权项`);
      // } else if (direction === 'left') {
      //   // 从右侧移除时更新对应类型的已选项
      //   if(this.formData.authMode === 2) {
      //     this.selectedCollections = this.selectedCollections.filter(c => !movedKeys.includes(c.key));
      //     // 移除对应集合的所有子项
      //     const removedCollections = this.selectedCollections.filter(c => movedKeys.includes(c.key));
      //     const itemsToRemove = removedCollections.reduce((acc, collection) => {
      //       return [...acc, ...collection.children.map(child => child.key)];
      //     }, []);
      //     this.selectedItems = this.selectedItems.filter(item => !itemsToRemove.includes(item.key));
      //   } else {
      //     this.selectedItems = this.selectedItems.filter(item => !movedKeys.includes(item.key));
      //   }
        
      //   this.$message.warning(`已移除 ${movedKeys.length} 个授权项`);
      // }
      // console.log('已选中项:', this.selectedItems);
      if (direction === 'right') {
        // 从左侧移动到右侧(新增授权)
        const movedItems = this.data.filter(item => {
          if(!item) return false;
          if(this.formData.authMode === 2) {
            return item.collectionCode && movedKeys.includes(item.collectionCode);
          } else if(this.formData.authMode === 0) {
            return item.groupCode && movedKeys.includes(item.groupCode);
          } else {
            return item.deviceCode && movedKeys.includes(item.deviceCode);
          }
        });
        
        if(this.formData.authMode === 0) { // 门禁权限组模式
          this.selectedGroups = [...this.selectedGroups, ...movedItems.map(item => item.groupCode)];
        } else if(this.formData.authMode === 1) { // 门禁点模式
          this.selectedPoints = [...this.selectedPoints, ...movedItems.map(item => item.deviceCode)];
        } else if(this.formData.authMode === 2) { // 门禁集合模式
          this.selectedCollections = [...this.selectedCollections, ...movedItems];
        }
        
        this.$message.success(`已添加 ${movedKeys.length} 个授权项`);
      } else if (direction === 'left') {
        // 从右侧移除时更新对应类型的已选项
        if(this.formData.authMode === 0) {
          this.selectedGroups = this.selectedGroups.filter(k => k && !movedKeys.includes(k));
        } else if(this.formData.authMode === 1) {
          this.selectedPoints = this.selectedPoints.filter(k => k && !movedKeys.includes(k));
        } else if(this.formData.authMode === 2) {
          this.selectedCollections = this.selectedCollections.filter(c => 
            c && c.collectionCode && !movedKeys.includes(c.collectionCode)
          );
        }
        this.$message.warning(`已移除 ${movedKeys.length} 个授权项`);
      }
      
      console.log('已选中项:', {
        groups: this.selectedGroups,
        points: this.selectedPoints,
        collections: this.selectedCollections
      });

      // 切换模式时自动刷新数据
      if(this.formData.authMode !== 2) {
        this.getLeftTableData();
      }
    },
    /** 获取左侧表格数据 */
    getLeftTableData() {
      if(!this.formData.lineNo && (this.formData.authMode === 0 || this.formData.authMode === 1)){
        this.data = [];
        this.$message.error('请选择线路');
        return;
      }
      try {
        this.loading = true;
        // 模拟数据
        const mockGroups = {
          'L00001': [
            { groupCode: 'g101', groupName: '线路1-权限组1', authMode: 0 },
            { groupCode: 'g102', groupName: '线路1-权限组2', authMode: 0 }
          ]
        };

        const mockPoints = {
          'L00001': [
            { deviceCode: 'p101', deviceName: '线路1-门禁点1', authMode: 1 },
            { deviceCode: 'p102', deviceName: '线路1-门禁点2', authMode: 1 }
          ]
        };

        const mockCollections = [
          {
            collectionCode: 'c1',
            collectionName: '集合1',
            authMode: 2,
            children: [
              { 
                groupCode: 'g101', 
                groupName: '线路1-权限组1', 
                authMode: 0,
                disabled: true // 禁止直接选择
              },
              { 
                deviceCode: 'p101', 
                deviceName: '线路1-门禁点1', 
                authMode: 1,
                disabled: true // 禁止直接选择
              }
            ]
          },
          {
            collectionCode: 'c2',
            collectionName: '集合2',
            authMode: 2,
            children: [
              { 
                groupCode: 'g102', 
                groupName: '线路1-权限组2', 
                authMode: 0,
                disabled: true
              },
              { 
                deviceCode: 'p102', 
                deviceName: '线路1-门禁点2', 
                authMode: 1,
                disabled: true
              }
            ]
          }
        ];
        // 根据权限模式选择数据
        let sourceData = [];
        switch(this.formData.authMode) {
          case 0: // 门禁权限组
            sourceData = (mockGroups[this.formData.lineNo] || []).map(item => ({
              key: item.groupCode,
              label: item.groupName,
              ...item
            }));
            // 过滤掉已在集合中的权限组
            sourceData = sourceData.filter(item => 
              !this.selectedCollections.some(collection => 
                collection.children.some(child => child.groupCode === item.groupCode)
              )
            );
            break;
          case 1: // 门禁点
            sourceData = (mockPoints[this.formData.lineNo] || []).map(item => ({
              key: item.deviceCode,
              label: item.deviceName,
              ...item
            }));
            // 过滤掉已在集合中的门禁点
            sourceData = sourceData.filter(item => 
              !this.selectedCollections.some(collection => 
                collection.children.some(child => child.deviceCode === item.deviceCode)
              )
            );
            break;
          case 2: // 门禁集合
            sourceData = mockCollections.map(item => ({
              key: item.collectionCode,
              label: item.collectionName,
              ...item
            }));
            break;
        }
        this.data = sourceData;
      } catch (error) {
        console.error('获取门禁数据失败', error);
        this.$message.error('获取门禁数据失败');
      } finally {
        this.loading = false;
      }
    },
  
  }
}
</script>

<style scoped>
.custom-transfer {
  width: calc(100% - 100px);
  height: calc(100vh - 210px);
  /* flex-wrap: nowrap; 禁止换行 */
  overflow: hidden;
  overflow-x: auto; /* 添加横向滚动 */
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
