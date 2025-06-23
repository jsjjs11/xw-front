/*
 * @copyright: 2021 NANJING SAC Rail Traffic Engineering CO., LTD
 * @Descripttion: 
 * @version: V1.0
 * @Author: ym
 * @Date: 2025-05-07 10:07:32
 * @LastEditors: ym
 * @LastEditTime: 2025-06-16 15:38:52
 */
import { listSimpleLineDatas } from '@/api/nacs/line/index'
import { TimePicker } from 'element-ui';

const state = {
  /**
   * 线路数据字典 MAP
   * key：数据字典大类枚举值 dictType
   * dictValue：数据字典小类数值 {dictValue: '', dictLabel: ''} 的数组
   */
  lineDatas: {}
}

const mutations = {
  SET_LINE_DATAS: (state, lineDatas) => {
    state.lineDatas = lineDatas
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';

    const cssRules  = lineDatas
      .map(
        item => `
        .color-radio-${item.lineNo}  .el-radio__input.is-checked .el-radio__inner {
          background-color: ${item.color} !important;
          border-color: ${item.color} !important;
        }
        .color-radio-${item.lineNo}   .el-radio__inner {
          border: 2px solid ${item.color}; !important;

        }
      `
      )
      .join('\n')

    styleElement.innerHTML = cssRules;
    document.head.appendChild(styleElement);

  }
}

const actions = {
  loadLineDatas({ commit }) {
    listSimpleLineDatas().then(response => {
      // 如果未加载到数据，则直接返回
      if (!response || !response.data) {
        return;
      }
      // 设置数据
      const lineDataMap = []
      response.data.forEach(lineData => {
        lineDataMap.push({
          id: lineData.id,
          lineNo: lineData.lineNo,
          name: lineData.name,
          color: lineData.color,
          authMode:lineData.authMode,
          timeCode:lineData.timeCode
        })
      })
      // 存储到 Store 中
      commit('SET_LINE_DATAS', lineDataMap)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
