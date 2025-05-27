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
            <el-select v-model="hasSelectionLineList"  multiple  placeholder="请选择线路" >
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
          @check="handleCheckChange"
          :load="loadNode"
          lazy
          :default-expanded-keys="['0']"

        >
          <template #default="{ node, data }">
            <div class="custom-node">

              <el-link type="primary" v-if="data.type=='group'"  :underline="false" @click="showGroupDetails(data)"   style="text-decoration: underline;">{{node.label}}
                <i class="el-icon-view el-icon--right"></i>
              </el-link>
              <span v-else>{{node.label}}</span>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 右侧已选择的 -->
<!--    <el-card class="box-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <div class="header-title">已选：{{ states.hasSelectionSonList.length }}</div>-->
<!--          <el-input v-model="states.hasSearchValue" placeholder="名称">-->
<!--            <template #suffix>-->
<!--              <i class="el-icon-search search-icon"  @click="searchUser('right')"></i>-->
<!--            </template>-->
<!--          </el-input>-->
<!--        </div>-->
<!--      </template>-->
<!--      <div>-->
<!--&lt;!&ndash;        <el-tree ref="treeRightRef" :data="states.hasSelectionList" default-expand-all :props="states.treeProps"&ndash;&gt;-->
<!--&lt;!&ndash;                 node-key="id" :expand-on-click-node="false" :filter-node-method="filterNode">&ndash;&gt;-->
<!--&lt;!&ndash;          <template #default="{ node, data }">&ndash;&gt;-->
<!--&lt;!&ndash;            <div class="custom-node">&ndash;&gt;-->
<!--&lt;!&ndash;              <span>{{ node.label }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              <span>&ndash;&gt;-->
<!--&lt;!&ndash;                <i class="el-icon-error  search-icon"  @click="removeUser(node, data)"></i>&ndash;&gt;-->
<!--&lt;!&ndash;              </span>&ndash;&gt;-->
<!--&lt;!&ndash;            </div>&ndash;&gt;-->
<!--&lt;!&ndash;          </template>&ndash;&gt;-->
<!--&lt;!&ndash;        </el-tree>&ndash;&gt;-->
<!--      </div>-->
<!--    </el-card>-->
  </div>
    <!--      :title="currentGroup.name + ' - 门禁点列表'"-->
    <!-- 权限组详情抽屉 -->
    <el-drawer

      :visible.sync="groupDetailDrawerVisible"
      direction="rtl"
      size="50%"
      :modal="true"
      :append-to-body="true"
      :modal-append-to-body="false"
      :destroy-on-close="true">
      <el-table :data="accessPointList" style="width: 100%">
        <el-table-column prop="deviceName" label="门禁点名称" align="center" />
        <el-table-column prop="deviceCode" label="设备编号" align="center" />
        <el-table-column prop="lineNo" label="线路ID" align="center" />
        <el-table-column prop="groupCode" label="权限组编码" align="center" />
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                  @pagination="getList"/>
    </el-drawer>
  </el-drawer>




</template>
<script>
import * as groupsApi from "@/api/nacs/d_groups/index";
import * as PermissionSetApi from '@/api/nacs/permission_set';
import {getLineDatas} from "@/utils/dict";
export default {
  name: "TreeTransfer",
  data() {
    return {
      checkedLeafIds: ['L00001-1-DEV0000001', 'L010Q2-2-1'], // 这些是后端返回的已勾选子节点
      parentMap: {}, // 保存子对父的映射，用于设置半选
      queryParams:{
        pageNo:0,
        pageSize:10,
        code:null,
      },
      total:0,
      selectedData: [{
        authMode: 1,
        code:"DEV0000001",
        name:"设备1",
        lineNo:"L00001",
        stationNo:""
      },{
        authMode: 2,
        code:"0",
        name:"所有区域",
        lineNo:"L010Q2",
        stationNo:""
      }],
      groupDetailDrawerVisible: false,
      accessPointList: [
        // {
        //   id: 1,
        //   lineNo: 'SZM2',
        //   groupCode: 'WJC_GROUP',
        //   deviceId: 'WJC_GATE_01',
        //   deviceName: '世界之窗站1号闸机'
        // },
        // {
        //   id: 2,
        //   lineNo: 'SZM2',
        //   groupCode: 'WJC_GROUP',
        //   deviceId: 'WJC_GATE_02',
        //   deviceName: '世界之窗站2号闸机'
        // },
        // {
        //   id: 3,
        //   lineNo: 'SZM2',
        //   groupCode: 'WJC_GROUP',
        //   deviceId: 'WJC_DOOR_01',
        //   deviceName: '世界之窗站站厅门'
        // }
      ],
      lineList: getLineDatas(),
      visible: false,
      hasSelectionLineList: [],
      line2DataMap : new Map(),
      station2DeviceMap : new Map(),
      states: {
        treeProps: {
          label: 'name',
          children: 'children',
          isLeaf: 'leaf'
        },
        allSearchValue: undefined,
        hasSearchValue: undefined,
        hasSelectionList: [],
        hasSelectionSonList: [],
        treeIds: [],
        treeData: [],
        defaultChecked: ["1-DEVICE:1"],
      }
    }
  },
  mounted() {
    const selectData = [{
      authMode: 1,
      code:"DEV0000001",
      name:"设备1",
      lineNo:"L00001",
      stationNo:""
    },{

      authMode: 2,
      code:"0",
      name:"所有区域",
      lineNo:"L010Q2",
      stationNo:""
    }]
    // const line = this.lineList.map(item=>{
    //   return {
    //     id: `${item.id}-${item.lineNo}`,
    //     name: item.name,
    //     parentId:'0',
    //     leaf: false,
    //   }
    // })
    // const root = [
    //   {
    //     id: '0',
    //     name: '南京地铁',
    //     parentId:'-1',
    //     leaf: false,
    //     children: line
    //   }
    // ]
    // this.states.treeData = root
  },
  methods: {
    async handleExpand(node, data) {
      // 延迟确保节点加载完成
      this.$nextTick(() => {
        // 手动设置已加载节点的半选状态
        this.setHalfCheckedNodes();
      });
    },
    setHalfCheckedNodes() {
      const tree = this.$refs.treeLeftRef;
      const allChecked = this.checkedLeafIds;

      // 反向递归找出需要半选的父节点
      const halfCheckedSet = new Set();
      allChecked.forEach((id) => {
        let parent = this.parentMap[id];
        while (parent) {
          halfCheckedSet.add(parent);
          parent = this.parentMap[parent];
        }
      });

      halfCheckedSet.forEach((pid) => {
        const node = tree.getNode(pid);
        if (node && !node.checked) {
          node.indeterminate = true;
        }
      });
    },
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
   async loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve(
            [{
              id: '0',
              name: '南京地铁',
              parentId:'-1',
              leaf: false,
            }]
        );
      }
      if (node.level == 1) {
        const line = this.lineList.map(item=>{
          return {
            id: `${item.id}-${item.lineNo}`,
            name: item.name,
            lineNo:item.lineNo,
            parentId:'0',
            authMode: item.authMode,
            type:'line'
          }
        })
        // 维护子对父映射
        line.forEach(child => {
          this.parentMap[child.id] = node.data.id;
        });
        resolve(line)
      }
     if (node.level == 2) {
       let res = await PermissionSetApi.getDevice({lineNo:node.data.lineNo});
       if(node.data.authMode==1){//按点授权
         const  station = res.data.stations.map(stationItem=>{
           const device = res.data.devices.map(item=>{
             if(stationItem.stationNo==item.stationNo){
               return{
                 id:`${res.data.lineNo}-${item.authMode}-${item.code}`,
                 name: item.name,
                 stationNo:item.stationNo,
                 authMode:item.authMode,
                 leaf: true,
                 code:item.code,
                 type:'device',
                 lineNo:node.data.lineNo
               }
             }
           })

           this.station2DeviceMap.set(`${res.data.lineNo}-${stationItem.stationNo}`,device)
           return {
             id: stationItem.stationNo,
             name: stationItem.name,
             key:`${res.data.lineNo}-${stationItem.stationNo}`,
           }
         })
         station.forEach(child => {
           this.parentMap[child.id] = node.data.id;
         });
         resolve(station)
       }else{//按组授权
           const groups = res.data.groups.map(item=>{
               return{
                 id:`${res.data.lineNo}-${item.authMode}-${item.code}`,
                 name: item.name,
                 authMode:item.authMode,
                 leaf: true,
                 code:item.code,
                 type:'group'
               }

           })
         groups.forEach(child => {
           this.parentMap[child.id] = node.data.id;
         });
         resolve(groups)
       }
     }
     if (node.level == 3) {
      const device = this.station2DeviceMap.get(node.data.key)
       if(device[0]){
         device.forEach(child => {
           this.parentMap[child.id] = node.data.id;
         });
         resolve(device)
       }
       else
         resolve([])
     }
     this.handleExpand()
    },
    //
    // convertToElTreeData(rawData) {
    //   const lineNodes = this.lineList.map(line=>{
    //     const groupNodes = (rawData.groups || []).map(group => ({
    //       id: group.groupCode,
    //       label: group.groupName,
    //       parentId:line.lineNo,
    //       authMode:group.authMode,
    //       children: [], // groups 无子节点
    //     }))
    //
    //     const stationNodes = rawData.stations.map(station => {
    //       const children = (station.devices || []).map(device => ({
    //         id: device.deviceCode,
    //         label: device.deviceName,
    //         parentId:station.stationNo,
    //         authMode:device.authMode,
    //       }))
    //       return {
    //         parentId:line.lineNo,
    //         id: station.stationNo,
    //         label: station.stationName,
    //         //disabled: true,
    //         children: children.length > 0 ? children : [],
    //       }
    //     })
    //     let  children = []
    //     if(rawData.lineNo==line.lineNo){
    //       children = [...groupNodes,...stationNodes]
    //     }
    //
    //     return {
    //       parentId:'0',
    //       id: line.lineNo,
    //       label: line.name,
    //       //disabled: true,
    //       children: children.length > 0 ? children : [],
    //     }
    //   })
    //
    //   return [
    //     {
    //       id: '0',
    //       label: '南京地铁',
    //       //disabled: true,
    //       parentId:'-1',
    //       children: [...lineNodes],
    //     },
    //   ]
    // },

    open() {
      this.clearData();
      //this.hasSelectionLineList.push(this.lineList[0].lineNo)  ;
      this.visible = true
      //this.initTree(this.lineList[0].lineNo);
    },
    // // 初始化左侧树
    // async initTree(lineNo) {
    //   let res = await PermissionSetApi.getDevice({lineNo:lineNo});
    //   this.line2DataMap.set(lineNo,res.data)
    //
    //   console.log(this.line2DataMap.keys())
    //   let treeData = {
    //     groups:[],
    //     stations:[]
    //   }
    //   this.line2DataMap.forEach((value, key) => {
    //     treeData.groups.push(...value.groups)
    //     treeData.stations.push(...value.stations)
    //   });
    //   this.states.treeData = this.convertToElTreeData(treeData)
    //   //this.states.defaultChecked = ['1-2']
    //   this.$nextTick(() => {
    //     this.handleCheckChange()
    //   })
    // },
    // 勾选处理
    handleCheckChange(selectData,state) {

      const selectedWithCode = checkedNodes.filter(node => node.code);

      console.log('选中的带 code 的节点：', selectedWithCode);


      console.log(selectData,state)
      console.log(this.$refs.treeLeftRef.getCheckedNodes())
      // this.states.hasSelectionSonList = this.$refs.treeLeftRef.getCheckedNodes(true)
      //
      // const data = this.$refs.treeLeftRef.getCheckedNodes(false, true)
      // const data2 = data.map(e => ({
      //   id: e.id,
      //   label: e.label,
      //   parentId: e.parentId
      // }))
      //this.states.hasSelectionList = this.handleTree(data2, "",'','','-1');
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
      this.hasSelectionLineList = []
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
