<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="1200px" append-to-body @close="close">
      <div class="card-container">
        <template v-if="createDisabled">
          <el-tooltip content="该用户已有卡，不能再开卡" placement="top">
            <el-button type="primary" plain icon="el-icon-plus" @click="creatCard" :disabled="createDisabled">开卡</el-button>
          </el-tooltip>
        </template>
        <template v-else>
          <el-button type="primary" plain icon="el-icon-plus" @click="creatCard" :disabled="createDisabled">开卡</el-button>
        </template>
        <div  class="card-list-container">
          <el-table v-loading="loading" :data="cardList" 
            @expand-change="handleExpandChange" 
            style="margin-top: 20px;" 
            :row-key="row => row.id"
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
            <el-table-column label="卡片来源" align="center" prop="cardSource">
              <template v-slot="scope">
                <dict-tag :type="DICT_TYPE.NACS_DATA_SOURCE" :value="scope.row.cardSource" />
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
            <el-table-column label="操作" align="center" width="260">
              <template v-slot="scope">
                <!-- 已激活状态(1)和代发卡状态(0)：显示挂失和加入黑名单按钮 -->
                <template v-if="scope.row.cardState === 1 || scope.row.cardState === 0">
                  <el-button
                    size="mini"
                    type="warning"
                    @click="handleLostCard(scope.row)">
                    挂失
                  </el-button>
                  <el-button
                    size="mini"
                    type="warning"
                    @click="handleFreezeCard(scope.row)">
                    冻结
                  </el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    @click="handleBlacklist(scope.row)">
                    加入黑名单
                  </el-button>
                </template>

                <!-- 已冻结状态(4)已挂失状态(2)或已注销状态(3)或黑名单状态(5)：显示恢复正常按钮 -->
                <template v-else-if="scope.row.cardState === 4 || scope.row.cardState === 2 || scope.row.cardState === 3 || scope.row.cardState === 5">
                  <el-button
                    size="mini"
                    type="success"
                    @click="handleRestore(scope.row)">
                    恢复正常
                  </el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 当没有线网卡时的线路侧卡片信息
        <div v-if="cardSource === 1 && lineCards.length > 0" class="line-card-container">
          <h4>该用户没有线网卡，以下是线路卡信息</h4>
          <el-table
            :data="lineCards"
            border
            style="width: 100%">
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
        </div> -->
        
        <!-- <div v-else-if="cardList.length === 0 && lineCards.length === 0" class="no-data-container">
          <p>暂无卡片信息</p>
        </div> -->
      </div>
    </el-dialog>
    <cards-form ref="cardFormRef" @success="getList" />
  </div>
</template>

<script>
import { getCards, updateCards, freezeCards, activateCards, addBlacklist, reportLost, checkEligibility, getLineCards } from '@/api/nacs/cards'
import CardsForm from '@/views/nacs/cards/CardsForm.vue'
import { DICT_TYPE, getLineDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: "UserCard",
  components: { CardsForm },
  data() {
    return {
      // 遮罩层
      loading: false,
      loadinglineCard: false,
      // 显示状态
      visible: false,
      // 标题
      title: '用户卡信息',
      // 总条数
      total: 0,
      // 卡列表数据
      cardList: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        idCard: undefined
      },
      userInfo:undefined,
      // 字典定义
      DICT_TYPE,
      createDisabled: false,
      lineCardslength: 0,
      lineMap: getLineDatas(),
      cardSource: 0, // 卡片来源
    }
  },
  methods: {
    /** 开卡 */
    creatCard() {
      if (this.userInfo.id === undefined) {
        this.$message.error("请先选择用户");
      } else {
        /** 添加/修改操作 */
        this.$refs["cardFormRef"].creadCard(this.userInfo, this.cardSource);
      }
    },
    /** 查询卡列表 */
    async getList() {
      try {
        this.loading = true;
        const response = await getCards(this.queryParams.idCard);
        if (response.data) {
          this.cardSource = response.data.cardSource;
          this.cardList = [response.data];
        } else {
          this.cardList = [];
        }
        const createable = await checkEligibility(this.queryParams.idCard)
        this.createDisabled = !createable.data;
      } catch (error) {
        console.error("获取卡列表失败", error);
        this.$modal.msgError("获取卡列表失败");
      } finally {
        this.loading = false;
      }
    },

    /** 查询线路侧卡片 */
    async loadLineCard() {
      try {
        const response = await getLineCards(this.queryParams.idCard)
        if (response.data) {
          // 将线路卡片信息附加到主卡对象
          if ( this.cardList.length > 0) {
            this.cardList.forEach(card => {
              this.$set(card, 'lineCard', response.data);
              this.lineCardslength = (response.data).length;
            });
            
          }
        } 
      } catch (error) {
        console.error("获取线路侧卡片失败", error);
      }
    },
     /** 处理展开行变化 */
    async handleExpandChange(row, expandedRows) {
      if (expandedRows.length > 0 && row) {
        this.loadinglineCard = true;
        try {
          await this.loadLineCard();
          // 确保数据加载完成后再设置展开状态
          this.$nextTick(() => {
            this.$refs.table.toggleRowExpansion(row, true);
          });
        } catch (error) {
          console.error("加载线路卡失败", error);
        } finally {
          this.loadinglineCard = false;
        }
      }
    },
    /** 显示弹框 */
    async show(form) {
      this.visible = true
      this.userInfo = form;
      this.queryParams.idCard = form.idCard;
      await this.getList()
      // const response = await checkEligibility(this.queryParams.idCard)
      // this.createDisabled = !response.data;
      // if (this.cardList.length > 0) {
      //   this.createDisabled = true;
      // } else {
      //   this.createDisabled = false;
      // }
    },
    /** 关闭弹框 */
    close() {
      this.visible = false
      this.reset()
    },
    /** 重置数据 */
    reset() {
      this.queryParams = {
        pageNo: 1,
        pageSize: 10,
        idCard: undefined
      }
      this.cardList = [];
      this.total = 0;
      this.lineCards = [];
    },
    // 时间格式化
    parseTime,
    /** 处理卡片挂失 */
    async handleLostCard(row) {
      // 检查卡片状态
      if (row.cardState === 0) {
        this.$modal.msgError("卡片未激活，不能进行挂失操作")
        return
      }
      if (row.cardState !== 1) {
        this.$modal.msgError("只有已激活的卡片才能进行挂失操作")
        return
      }

      try {
        await this.$modal.confirm('确认要挂失该卡片吗？')
        this.loading = true
        // const data = { ...row, cardState: 2 }
        // await updateCards(data)
        await reportLost(row.id)
        this.$modal.msgSuccess("卡片已挂失")
        await this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$modal.msgError('挂失失败')
        }
        console.error("挂失操作失败", error)
      } finally {
        this.loading = false
      }
    },
    /** 处理卡片冻结 */
    async handleFreezeCard(row) {
      // 检查卡片状态
      if (row.cardState === 0) {
        this.$modal.msgError("卡片未激活，不能进行冻结操作")
        return
      }
      if (row.cardState !== 1) {
        this.$modal.msgError("只有已激活的卡片才能进行冻结操作")
        return
      }

      try {
        await this.$modal.confirm('确认要冻结该卡片吗？')
        this.loading = true
        await freezeCards(row.id)
        this.$modal.msgSuccess("卡片已冻结")
        await this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$modal.msgError('冻结失败')
        }
        console.error("冻结操作失败", error)
      } finally {
        this.loading = false
      }
    },
    /** 处理加入黑名单 */
    async handleBlacklist(row) {
      // 检查卡片状态
      if (row.cardState === 0) {
        this.$modal.msgError("卡片未激活，不能加入黑名单")
        return
      }
      if (row.cardState !== 1) {
        this.$modal.msgError("只有已激活的卡片才能加入黑名单")
        return
      }

      try {
        await this.$modal.confirm('确认要将该卡片加入黑名单吗？')
        this.loading = true
        // const data = { ...row, cardState: 3 }
        // await updateCards(data)
        await addBlacklist(row.id)
        this.$modal.msgSuccess("卡片已加入黑名单")
        await this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$modal.msgError('加入黑名单失败')
        }
        console.error("加入黑名单操作失败", error)
      } finally {
        this.loading = false
      }
    },

    /** 处理恢复正常 */
    async handleRestore(row) {
      // 修改状态检查逻辑，允许已挂失和已注销的卡片恢复正常
      if (row.cardState !== 2 && row.cardState !== 3 && row.cardState !== 4 && row.cardState !== 5) {
        this.$modal.msgError("只有已挂失、已冻结、已注销或黑名单的卡片才能恢复正常")
        return
      }

      try {
        await this.$modal.confirm('确认要将该卡片恢复正常状态吗？')
        this.loading = true
        // const data = { ...row, cardState: 1 } // 改为激活状态
        // await updateCards(data)
        await activateCards(row.id)
        this.$modal.msgSuccess("卡片已恢复正常")
        await this.getList()
      } catch (error) {
        console.error("恢复操作失败", error)
        if (error !== 'cancel') {
          this.$modal.msgError('恢复失败')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.card-container {
    padding: 0 10px;
}

.el-button + .el-button {
  margin-left: 5px;
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
