<template>
  <el-drawer
    :visible.sync="visible"
    direction="rtl"
    size="80%"
    :modal="true"
    :append-to-body="true"
    :modal-append-to-body="false"
    :destroy-on-close="true"
  >
  <div class="card-list">
    <!-- 左侧全部 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">全部</div>
          <el-input v-model="states.allSearchValue" placeholder="名称">
            <template #suffix>
              <i class="el-icon-search search-icon"  @click="searchUser('left')"></i>
            </template>
          </el-input>
          <div style="padding-top: 10px">
            <el-select v-model="hasSelectionLineList"  multiple  placeholder="请选择线路">
              <el-option
                v-for="line in lineList"
                :key="parseInt(line.id)"
                :label="line.name"
                :value="line.lineNo"
              />
            </el-select>
          </div>
        </div>
      </template>
      <div>
        <el-tree
          ref="treeLeftRef"
          :data="states.treeData"
          show-checkbox
          :props="states.treeProps"
          node-key="id"
          :filter-node-method="filterNode"
          :default-checked-keys="states.defaultChecked"
          default-expand-all
          @check="handleCheckChange"
        >
        </el-tree>
      </div>
    </el-card>

    <!-- 右侧已选择的 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">已选：{{ states.hasSelectionSonList.length }}</div>
          <el-input v-model="states.hasSearchValue" placeholder="名称">
            <template #suffix>
              <i class="el-icon-search search-icon"  @click="searchUser('right')"></i>
            </template>
          </el-input>
        </div>
      </template>
      <div>
        <el-tree ref="treeRightRef" :data="states.hasSelectionList" default-expand-all :props="states.treeProps"
                 node-key="id" :expand-on-click-node="false" :filter-node-method="filterNode">
          <template #default="{ node, data }">
            <div class="custom-node">
              <span>{{ node.label }}</span>
              <span>
                <i class="el-icon-error  search-icon"  @click="removeUser(node, data)"></i>
              </span>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>
  </div>
  </el-drawer>
</template>
<script>
import * as PermissionSetApi from '@/api/nacs/permission_set';
import {getLineDatas} from "@/utils/dict";
export default {
  name: "TreeTransfer",
  data() {
    return {
      lineList: getLineDatas(),
      visible: false,
      hasSelectionLineList: [],
      states: {
        treeProps: {
          label: 'label',
          children: 'children',
        },
        allSearchValue: undefined,
        hasSearchValue: undefined,
        hasSelectionList: [],
        hasSelectionSonList: [],
        treeIds: [],
        treeData: [],
        defaultChecked: [],
      }
    }
  },
  mounted() {

  },
  methods: {
    convertToElTreeData(rawData) {
      const lineNodes = this.lineList.map(line=>{
        const groupNodes = (rawData.groups || []).map(group => ({
          id: group.groupCode,
          label: group.groupName,
          parentId:line.lineNo,
          children: [], // groups 无子节点
        }))

        const stationNodes = rawData.stations.map(station => {
          const children = (station.devices || []).map(device => ({
            id: device.deviceCode,
            label: device.deviceName,
            parentId:station.stationNo,
          }))
          return {
            parentId:'-1',
            id: station.stationNo,
            label: station.stationName,
            disabled: true,
            children: children.length > 0 ? children : [],
          }
        })
        let  children = []
        if(rawData.lineNo==line.lineNo){
          children = [...groupNodes,...stationNodes]
        }
        return {
          parentId:'-1',
          id: line.lineNo,
          label: line.name,
          disabled: true,
          children: children.length > 0 ? children : [],
        }
      })

      return [
        {
          id: '-1',
          label: '南京地铁',
          disabled: true,
          children: [...lineNodes],
        },
      ]
    },

    open() {
      this.hasSelectionLineList.push(this.lineList[0].lineNo)  ;
      this.visible = true
      this.initTree();
    },
    // 初始化左侧树
    async initTree() {
      let res = await PermissionSetApi.getDevice({lineNo:this.lineList[0].lineNo});
      this.states.treeData = this.convertToElTreeData(res.data)
      //this.states.defaultChecked = ['1-2']
      this.$nextTick(() => {
        this.handleCheckChange()
      })
    },
    // 勾选处理
    handleCheckChange(selectData,state) {
      console.log(selectData,state)
      this.states.hasSelectionSonList = this.$refs.treeLeftRef.getCheckedNodes(true)

      const data = this.$refs.treeLeftRef.getCheckedNodes(false, true)
      const data2 = data.map(e => ({
        id: e.id,
        label: e.label,
        parentId: e.parentId
      }))
      this.states.hasSelectionList = this.handleTree(data2, "id",'','','-1');
    },

    // 树过滤节点
    filterNode(value, data) {
      if (!value) return true
      return data.name.includes(value)
    },

    // 查询用户
    searchUser(type) {
      console.log(this.states.hasSelectionList)
      if (type === 'left') {
        this.$refs.treeLeftRef.filter(this.states.allSearchValue)
      } else {
        this.$refs.treeLeftRef.filter(this.states.hasSearchValue)
      }
    },

    // 移除用户
    removeUser(node, data) {

      this.$refs.treeLeftRef.setChecked(data, false, true)
        this.handleCheckChange()

    },

    // 清除所有数据
    clearData() {
      this.states.hasSelectionList = []
      this.states.hasSelectionSonList = []
      this.states.allSearchValue = undefined
      this.states.hasSearchValue = undefined
      this.states.treeIds = []
      this.states.treeData = []
      this.states.defaultChecked = []
    }
  },

}
</script>
<style scoped lang="scss">
.card-list {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  .box-card {
    width: 35%;
    height: 500px;
    .card-header{
      height: 150px;
    }
    ::v-deep .el-card__header{
      height: 150px;
    }
    .header-title {
      padding-bottom: 10px;
    }
    ::v-deep  .el-card__body{
      height: calc(100% - 150px);
      overflow: auto;
    }
    .custom-node {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  }
}
.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
  font-size: 16px; /* 你可以根据需要调整大小 */
}
::v-deep  .el-select{
  width: 100%;
}

//.icon-size {
//  width: 18px;
//  height: 18px;
//  cursor: pointer;
//}
</style>
