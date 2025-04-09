import request from '@/utils/request'

// 创建门禁卡片管理
export function createCards(data) {
  return request({
    url: '/nacs/cards/create',
    method: 'post',
    data: data
  })
}

// 更新门禁卡片管理
export function updateCards(data) {
  return request({
    url: '/nacs/cards/update',
    method: 'put',
    data: data
  })
}

// 删除门禁卡片管理
export function deleteCards(id) {
  return request({
    url: '/nacs/cards/delete?id=' + id,
    method: 'delete'
  })
}

// 获得门禁卡片管理
export function getCards(id) {
  return request({
    url: '/nacs/cards/get?id=' + id,
    method: 'get'
  })
}

// 获得门禁卡片管理分页
export function getCardsPage(params) {
  return request({
    url: '/nacs/cards/page',
    method: 'get',
    params
  })
}
// 导出门禁卡片管理 Excel
export function exportCardsExcel(params) {
  return request({
    url: '/nacs/cards/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}