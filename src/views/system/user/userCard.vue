<template>
  <div>
    <el-dialog :title="title" :visible.sync="visible" width="900px" append-to-body>
      <div class="card-container">
        <el-button type="primary" plain icon="el-icon-plus" @click="creatCard">新增门禁卡</el-button>
        <el-table v-loading="loading" :data="cardList" style="margin-top: 20px;">
          <el-table-column label="物理卡号" align="center" prop="cardId" />
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
        </el-table>

        <!-- 分页组件 -->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </div>
    </el-dialog>
    <cards-form ref="cardFormRef" @success="getList" />
  </div>
</template>

<script>
import { getCardsPage } from '@/api/nacs/cards'
import CardsForm from '@/views/nacs/cards/CardsForm.vue'
import { DICT_TYPE } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: "UserCard",
  components: { CardsForm },
  data() {
    return {
      // 遮罩层
      loading: false,
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
        employeeId: undefined
      },
      userInfo:undefined,
      // 字典定义
      DICT_TYPE
    }
  },
  methods: {
    /** 开卡 */
    creatCard() {
      if (this.userInfo.id === undefined) {
        this.$message.error("请先选择用户");
      } else {
        /** 添加/修改操作 */
        this.$refs["cardFormRef"].creadCard(this.userInfo);
      }
    },
    /** 查询卡列表 */
    async getList() {
      try {
        this.loading = true
        const response = await getCardsPage(this.queryParams)
        this.cardList = response.data.list
        this.total = response.data.total
      } catch (error) {
        console.error("获取卡列表失败", error)
        this.$modal.msgError("获取卡列表失败")
      } finally {
        this.loading = false
      }
    },
    /** 显示弹框 */
    async show(form) {
      this.visible = true
      this.userInfo = form;
      this.queryParams.employeeId = form.id;
      await this.getList()
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
        employeeId: undefined
      }
      this.cardList = []
      this.total = 0
    },
    // 时间格式化
    parseTime
  }
}
</script>

<style scoped>
.card-container {
    padding: 0 10px;
}


</style>
