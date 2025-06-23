<template>
    <div class="overview-container">
        <!-- Top Stats -->
        <el-card class="stats-card" style="height: 100px;">
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-title">线网线路总数</div>
                    <div class="stat-value">1</div>
                </div>
                <div class="stat-item">
                    <div class="stat-title">已接入线路</div>
                    <div class="stat-value" style="color: #409EFF;">1</div>
                </div>
                <div class="stat-item">
                    <div class="stat-title">未接入线路</div>
                    <div class="stat-value" style="color: #F56C6C;">0</div>
                </div>
                <div class="stat-item">
                    <div class="stat-title">员工总数</div>
                    <div class="stat-value">1,240</div>
                </div>
                <div class="stat-item">
                    <div class="stat-title">已授权员工</div>
                    <div class="stat-value" style="color: #409EFF;">1,234</div>
                </div>
                <div class="stat-item">
                    <div class="stat-title">未授权员工</div>
                    <div class="stat-value" style="color: #F56C6C;">6</div>
                </div>
                <div class="stat-item no-border">
                    <div class="stat-title">门禁点</div>
                    <div class="stat-value">586</div>
                </div>
            </div>
        </el-card>

        <!-- Main Content -->
        <el-row :gutter="20">
            <!-- Left Column -->
            <el-col :span="14">
                <el-card class="content-card" style="height: calc(100vh - 240px);">
                    <div slot="header">
                        <span>地铁运行线路图</span>
                    </div>
                    <div style="width: 100%; height: 100%; position: relative;">
                        <img src="@/assets/images/xianluda.png"
                            style="width: 100%; height: 100%; object-fit: contain;" />
                    </div>

                </el-card>
            </el-col>

            <!-- Right Column -->
            <el-col :span="10">
                <el-card class="content-card" style="height: calc(100vh - 240px);">
                    <div slot="header" class="clearfix">
                        <span>运营事件动态</span>
                    </div>
                    <div class="timeline-container">
                        <el-timeline>
                            <el-timeline-item v-for="(activity, index) in activities" :key="index" placement="top">
                                <div class="timeline-item-content">
                                    <div class="avatar">
                                        <span class="avatar-text">管</span>
                                    </div>
                                    <div class="content">
                                        <div class="title-time">
                                            <span class="title">管理员</span>
                                            <span class="time">{{ activity.timestamp }}</span>
                                        </div>
                                        <p class="description" v-html="activity.content"></p>
                                    </div>
                                </div>
                            </el-timeline-item>
                        </el-timeline>
                    </div>
                    <div class="more-button-container">
                        <el-button type="text">更多</el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
  name: "Overview",
  data() {
    return {
      activities: [
        {
          timestamp: '12月07日 11:51',
          content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
        },
        {
          timestamp: '12月07日 11:51',
          content: '删除卡: 2143512410CC9282, 持卡人: 程余1125',
        },
        {
          timestamp: '12月07日 11:48',
          content: '新开卡: 2143512410CC9282, 持卡人: 程余1125<br>卡号: 2143512410CC9282 有效期: 00:00-00:00 卡类型: 1',
        },
        {
          timestamp: '12月07日 11:47',
          content: '删除卡: 952555552222, 持卡人: 程余1125',
        },
        {
          timestamp: '11月25日 10:40',
          content: '更新了员工信息<br>员工姓名: 程余1125 员工工号: 20221125',
        },
        {
          timestamp: '11月25日 10:39',
          content: '更新了员工信息<br>员工姓名: 程余1125 员工工号: 20221125',
        },
        {
          timestamp: '11月25日 10:35',
          content: '新开卡: 952555552222, 持卡人: 程余1125<br>卡号: 952555552222 有效期: 00:00-00:00 卡类型: 1',
        },
         {
          timestamp: '12月07日 11:51',
          content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
        },
            {
                timestamp: '12月07日 11:51',
                content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
            },
            {
                timestamp: '12月07日 11:51',
                content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
            },
            {
                timestamp: '12月07日 11:51',
                content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
            },
            {
                timestamp: '12月07日 11:51',
                content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
            },
            {
                timestamp: '12月07日 11:51',
                content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
            },
            {
                timestamp: '12月07日 11:51',
                content: '新开卡: 9282143512410C, 持卡人: 程余1125<br>卡号: 9282143512410C 有效期: 00:00-00:00 卡类型: 1',
            },
      ]
    };
  }
};
</script>

<style scoped lang="scss">
.overview-container {
  padding: 20px;
  background-color: #f0f2f5;
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.stats-card {
  margin-bottom: 20px;
  flex-shrink: 0;
  height: 100px;
}

.stats-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  padding: 0 40px;
  border-right: 1px solid #DCDFE6;
}

.stat-item.no-border {
  border-right: none;
}

.stat-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.content-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  ::v-deep .el-card__body {
    flex-grow: 1; // flex-grow: 1 表示该元素会占用父容器中所有剩余的可用空间
    display: flex;
    flex-direction: column;

    overflow: auto;
  }
   ::v-deep .el-card__header{
    flex-shrink: 0;
  }
}

.el-row {
    flex-grow: 1;
}

.timeline-container {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.timeline-item-content {
  display: flex;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #1890ff;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    margin-right: 16px;

    .avatar-text {
        font-size: 14px;
    }
  }

  .content {
    flex-grow: 1;
    .title-time {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .title{
             font-weight: bold;
        }
        .time{
            color: #909399;
            font-size: 13px;
        }
    }
    .description {
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
    }
  }
}
::v-deep .el-timeline-item__content{
    width: 100%;
}
::v-deep .el-timeline-item__tail {
    left: 19px;
}
::v-deep .el-timeline-item__node--normal {
    left: 13px;
}


.more-button-container {
  text-align: center;
  padding: 10px;
  border-top: 1px solid #EBEEF5;
  flex-shrink: 0;
}
</style>
