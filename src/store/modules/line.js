import { listSimpleLineDatas } from '@/api/nacs/line/index'

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
