<!--
 * @copyright: 2021 NANJING SAC Rail Traffic Engineering CO., LTD
 * @Descripttion: 
 * @version: V1.0
 * @Author: ym
 * @Date: 2025-03-24 10:18:50
 * @LastEditors: ym
 * @LastEditTime: 2025-03-24 14:20:58
-->
<template>
<div>
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
             <Icon icon="ep:question-filled" />
            <el-form-item label="开启状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                          :key="dict.value" :label="parseInt(dict.value)">{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
            
          </el-form>
</div>
</template>
<script>
import {CommonStatusEnum} from "@/utils/constants";
export default {
    
  name: "testView",
  components: {  },
  data() {
    return {
           // 表单参数
      form: {
         status: CommonStatusEnum.DISABLE,
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: "表单名不能为空", trigger: "blur" }],
        status: [{ required: true, message: "开启状态不能为空", trigger: "blur" }],
      }
    };
  },
  methods:{

  },
  mounted() {
    this.$nextTick(() => {
      console.log(this.DICT_TYPE.COMMON_STATUS)
      let ss = this.getDictDatas(this.DICT_TYPE.COMMON_STATUS)
      console.log(ss)
    })
  },
};
</script>
