<template>
  <el-drawer
    :title="dialogTitle"
    :visible.sync="visible"
    direction="rtl"
    size="80%"
    :modal="true"
    :append-to-body="true"
    :modal-append-to-body="false"
    :destroy-on-close="true"
    >
<!--  <el-dialog :title="dialogTitle" :visible.sync="visible" width="1400px" append-to-body @open="handleAuthDialogOpen" >-->
    <el-form ref="form" :model="formData" label-width="100px">
      <el-form-item label="" prop="authItems" class="auth-items">

          <div class="auth-column">
            <el-col :span="4">
              <!-- 线路列 -->
              <div class="column line-list">
                <div class="section-title">线路列表</div>
                <el-radio-group v-model="form.selectedLine" @change="onLineChange">
                  <el-timeline class="custom-timeline">
                    <el-timeline-item
                      v-for="line in lineList"
                      :key="line.lineNo"
                      size="large">
                      <template #dot>
                        <el-radio :label="line.lineNo" :class="`color-radio-${line.lineNo}`">
                          {{ line.name }}
                        </el-radio>
                      </template>
                    </el-timeline-item>
                  </el-timeline>
                </el-radio-group>
              </div>
            </el-col>
            <!-- 车站列 -->
            <el-col :span="4">
              <div class="column station-list">
                <div class="section-title">车站列表</div>
                <el-checkbox-group v-model="form.selectedStation" @change="onStationChange">
                  <el-checkbox v-for="station in stationList" :key="station.stationNo" :label="station.stationNo">
                    {{ station.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-col>

            <!-- 门禁列 -->
            <el-col :span="16">
              <div class="column auth-transfer">
                <div class="section-title">门禁列表</div>
                <el-transfer
                  style="text-align: left; display: inline-block;"
                  v-model="values"
                  filterable
                  :left-default-checked="[]"
                  :right-default-checked="[]"
                  :titles="['可选权限', '已选权限']"
                  :format="{
										noChecked: '${total}',
										hasChecked: '${checked}/${total}'
									}"
                  @change="handleChange"
                  :data="authList"
                  class="custom-transfer">
                  <div slot-scope="{ option }" >
                    <el-link type="primary" v-if="option.authMode==0"  :underline="false"  style="text-decoration: underline;">{{ option.label }}
                      <i class="el-icon-view el-icon--right"></i>
                    </el-link>
                    <span v-else>{{ option.label}}</span>
                  </div>
                </el-transfer>

              </div>
            </el-col>
          </div>
      </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注"  />
        </el-form-item>

    </el-form>
    <div class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
<!--      <el-button type="primary" @click="handleAuthConfirm">确 定</el-button>-->
    </div>
  </el-drawer>
</template>

<script>
import {getLineDatas} from "@/utils/dict";
import * as LineApi from '@/api/nacs/line';
export default {
  name: "PermissionSetDetailForm",
  props:[
    'setCode',"selectedList"
  ],// 集合编号（主表的关联字段）
  data() {
    return {

      form: {
        selectedLine: '',
        selectedStation: [],
        searchAuth: '',
        authItems: [],
      },
      lineList: getLineDatas(),
      stationList: [],
      authList: [],
      values: [],
      selectedStationsCache: new Set(),
      existAuth: 0,
      visible: false,
      dialogTitle: '',
      // 门禁组选项
      groupOptions: [],
      // 门禁点选项
      deviceOptions: [],
      formData: {
        authMode: 0,
        groupIds: [], // 选中的门禁组ID数组
        deviceIds: [], // 选中的门禁点ID数组
        remark: undefined
      },
    }
  },
  methods: {
    /** 获取车站数据 */
    async onLineChange() {
      if(this.form.selectedLine){
        const res = await LineApi.line2Station({lineNo:this.form.selectedLine});
        this.stationList = res.data
        // this.form.selectedStation = this.stationList.length ? this.stationList[0].stationNo : null;
        // 恢复之前选中的车站
        this.form.selectedStation = this.stationList
          .filter(station => this.selectedStationsCache.has(station.stationNo))
          .map(station => station.stationNo) || [];
        // console.log('恢复选中的车站:', this.form.selectedStation);
        // 不自动触发onStationChange，保留原有门禁数据
        if(this.form.selectedStation.length > 0) {
          await this.onStationChange();
        }
      }
    },
    /** 获取门禁数据 */
    async onStationChange() {
      if(this.form.selectedStation && this.form.selectedStation.length > 0){
        // 更新已选车站缓存
        this.selectedStationsCache = new Set(this.form.selectedStation);
        this.authList = this.form.selectedStation.flatMap(stationNo => {
          if(stationNo === 'S00001') {
            return [
              {
                key: 'bgz-001',
                label: '八卦洲A区门禁组',
                authMode: 0,
                groupCode: 'bgz-001',
                groupName: '八卦洲A区门禁组'
              },
              {
                key: 'bgz-002',
                label: '八卦洲B区门禁组',
                authMode: 0,
                groupCode: 'bgz-002',
                groupName: '八卦洲B区门禁组'
              },
              {
                key: 'bgz-dev-001',
                label: '八卦洲1号门禁点',
                authMode: 1,
                deviceCode: 'bgz-dev-001',
                deviceName: '八卦洲1号门禁点'
              }
            ];
          } else if(stationNo === 'S00002') {
            return [
              {
                key: 'bds-001',
                label: '笆斗山办公区门禁组',
                authMode: 0,
                groupCode: 'bds-001',
                groupName: '笆斗山办公区门禁组'
              },
              {
                key: 'bds-dev-001',
                label: '笆斗山1号门禁点',
                authMode: 1,
                deviceCode: 'bds-dev-001',
                deviceName: '笆斗山1号门禁点'
              },
              {
                key: 'bds-dev-002',
                label: '笆斗山2号门禁点',
                authMode: 1,
                deviceCode: 'bds-dev-002',
                deviceName: '笆斗山2号门禁点'
              }
            ];
          }
          return [];
        });
      } else {
        this.authList = [];
      }
      console.log('门禁列表:', this.authList);
    },
    /** 穿梭框变化 */
    handleChange(value, direction, movedKeys) {
      console.log('传输变化:', value, direction, movedKeys);
      if (!movedKeys || movedKeys.length === 0) return;
      if (direction === 'right') {
        this.values = value;
        this.$message.success(`已添加 ${movedKeys.length} 个授权项`);
      } else if (direction === 'left') {
        this.values = value;
        this.$message.warning(`已移除 ${movedKeys.length} 个授权项`);
      }
    },

    // // 添加对话框打开事件处理
    // handleAuthDialogOpen() {
    //   if (!this.formData.authType ) {
    //     this.$set(this.formData, 'authMode', 0);
    //     this.loadGroupOptions()
    //   }
    // },
    // /** 处理授权模式变更 */
    // handleAuthModeChange(value) {
    //   // 根据授权模式加载不同的数据
    //   if (value === 0) {
    //     this.loadGroupOptions()
    //   }
    // },
    //
    // /** 加载门禁组数据 */
    // async loadGroupOptions() {
    //   try {
    //     //const res = await getDGroupList()
    //     let res = {data:[
    //         {
    //           "id": 1,
    //           "lineId": "7",
    //           "group_code": "101",
    //           "group_name": "主楼大厅门禁",
    //           "type":1,
    //         },
    //         {
    //           "id": 2,
    //           "lineId": "7",
    //           "group_code": "102",
    //           "group_name": "主楼电梯门禁",
    //           "type":0,
    //         },
    //         {
    //           "id": 3,
    //           "lineId": "7",
    //           "group_code": "201",
    //           "group_name": "东区侧门门禁"
    //         },
    //         {
    //           "id": 4,
    //           "lineId": "7",
    //           "group_code": "202",
    //           "group_name": "东区停车场门禁"
    //         },
    //         {
    //           "id": 5,
    //           "lineId": "7",
    //           "group_code": "301",
    //           "group_name": "西区实验室门禁"
    //         },
    //         {
    //           "id": 6,
    //           "lineId": "7",
    //           "group_code": "302",
    //           "group_name": "西区仓库门禁"
    //         },
    //         {
    //           "id": 7,
    //           "lineId": "7",
    //           "group_code": "401",
    //           "group_name": "南区员工通道"
    //         },
    //         {
    //           "id": 8,
    //           "lineId": "7",
    //           "group_code": "402",
    //           "group_name": "南区消防通道"
    //         },
    //         {
    //           "id": 9,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 19,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 29,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 39,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 49,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 59,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 69,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 79,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 89,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 99,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道"
    //         },
    //         {
    //           "id": 119,
    //           "lineId": "7",
    //           "group_code": "501",
    //           "group_name": "北区VIP通道11111"
    //         },
    //       ]}
    //     this.groupOptions = res.data.map(item => ({
    //       id: item.id,
    //       name: item.group_name,
    //       code: item.group_code,
    //       lineId:item.lineId,
    //       type:item.type
    //     }))
    //   } catch (error) {
    //     console.error('加载门禁组失败:', error)
    //     this.$modal.msgError('加载门禁组失败')
    //   }
    // },


    async open(id) {
      this.reset()
      this.visible = true
      if(this.lineList.length>1){
        this.form.selectedLine = this.lineList[0].lineNo
      }
      this.onLineChange(); // 默认载入第一条线路的站点

      if (id) {
        this.dialogTitle = "修改权限集详情"
        // 根据列表数据设置默认值
        // const row = {
        //   id: 1,
        //   authMode: 0, // 默认按组授权
        //   remark: '测试数据1'
        // }
        //
        // this.formData = {
        //   ...row,
        //   groupIds: [], // 根据实际数据设置
        //   deviceIds: [] // 根据实际数据设置
        // }
        //
        // // 根据授权模式加载对应数据
        // this.handleAuthModeChange(row.authMode)
      } else {
        this.dialogTitle = "新增权限集详情"
      }
    },

    // submitForm() {
    //
    //   console.log(getLineDatas())
    //   this.$refs["form"].validate(async valid => {
    //     if (!valid) return
    //     try {
    //       let submitData = []
    //       let groupIdsData = []
    //       let deviceIdsData = []
    //       // 处理按组授权的数据
    //       if (this.formData.groupIds.length > 0) {
    //         // 找到选中的门禁组对应的数据
    //         groupIdsData = this.formData.groupIds.map(groupId => {
    //           const groupInfo = this.groupOptions.find(item => item.id === groupId)
    //           return {
    //             lineId: groupInfo.lineId,
    //             logicDeciveCode: groupInfo.groupCode, // 使用门禁组的编号
    //             authMode: 0,
    //             setCode: this.setCode,
    //             remark: this.formData.remark
    //           }
    //         })
    //       }
    //       // 处理按点授权的数据
    //       if ( this.formData.deviceIds.length > 0) {
    //         // 找到选中的门禁点对应的数据
    //         deviceIdsData = this.formData.deviceIds.map(deviceId => {
    //           const deviceInfo = this.deviceOptions.find(item => item.id === deviceId)
    //           return {
    //             lineId: deviceInfo.lineId,
    //             logicDeciveCode: deviceInfo.deviceCode,
    //             authMode: 1,
    //             setCode: this.setCode,
    //             remark: this.formData.remark
    //           }
    //         })
    //       }
    //       submitData = [...groupIdsData, ...deviceIdsData]
    //       console.log('提交的数据数组：', submitData)
    //       this.visible = false
    //       this.$modal.msgSuccess(data.id ? "修改成功" : "新增成功")
    //       this.$emit('success')
    //     } catch (error) {
    //       this.$modal.msgError("操作失败")
    //     }
    //   })
    // },

    cancel() {
      this.visible = false
      this.reset()
    },
    reset() {
      this.form = {
        selectedLine: '',
        selectedStation: [],
        searchAuth: '',
        authItems: [],
      };
      this.selectedStationsCache.clear();
      this.resetForm("form")
    }

  }
}
</script>

<style scoped lang="scss">
:deep(.auth-items) {
  /* 改为块级布局 */
  display: block !important;
/* 标签容器样式 */
.el-form-item__label {
  display: block;
  text-align: left !important;
  padding-bottom: 16px;  /* 增加标签与内容间距 */
  line-height: 1.5;
  margin-left: 30px !important;
}

/* 内容区域样式 */
.el-form-item__content {
  display: block;
  margin-left: 30px !important;

}
}

/* 三列布局 */
.auth-columns {
  display: flex;
  gap: 20px;
  margin-top: 15px;

}

/* 列公共样式 */
.column {
  flex: 1;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

/* 滚动条设置 */
.line-list,
.station-list {
  height: calc(100vh - 300px);
  overflow-y: auto;
}

.auth-transfer {
  height: calc(100vh - 300px);
  overflow: auto; /* 同时具备横向和纵向滚动 */
}

/* 时间线样式优化 */
:deep(.custom-timeline) {
  padding-left: 10px;
.el-timeline-item__node {
  background: transparent;
}
}

/* 单选按钮样式 */
.el-radio {
  display: block;
  margin: 8px 0;
}
:deep(.station-list) .el-checkbox {
  margin-bottom: 0px;
  display: block;
}
::v-deep .el-timeline-item__tail {
  left: 6px;
  margin-top: 18px;
}
::v-deep .el-timeline-item__timestamp.is-top {
  margin-bottom: 3px;
}
::v-deep(.custom-timeline-station)  .el-timeline-item {
  padding-bottom: 10px;
}
::v-deep .el-timeline-item {
  padding-bottom: 18px;
}
.dialog-footer {
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  text-align: right;
  border-top: 1px solid #e8e8e8;
}
::v-deep .el-transfer {
  margin-left: 7px;
}
::v-deep .el-transfer-panel{
  width: 370px; /* 左右两个穿梭框的高度和宽度 */
  height: calc(100vh - 360px);
}
::v-deep .el-transfer-panel__list.is-filterable {
  height: calc(100vh - 400px);
}

</style>

