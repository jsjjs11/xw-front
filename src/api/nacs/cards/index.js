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
export function cancelCards(id) {
  return request({
    url: '/nacs/cards/cancel?id=' + id,
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

// 挂失门禁卡管理
export function reportLost(id) {
  return request({
    url: '/nacs/cards/reportLost?id=' + id,
    method: 'put'
  })
}

// 激活门禁卡片管理
export function activateCards(id) {
  return request({
    url: '/nacs/cards/activate?id=' + id,
    method: 'put'
  })
}

// 冻结门禁卡片管理
export function freezeCards(id) {
  return request({
    url: '/nacs/cards/freeze?id=' + id,
    method: 'put'
  })
}

// 门禁卡加入黑名单
export function addBlacklist(id) {
  return request({
    url: '/nacs/cards/blacklist?id=' + id,
    method: 'put'
  })
}

// 用户门禁卡是否已激活
export function isCardActive(data) {
  return request({
    url: '/nacs/cards/card-state',
    method: 'post',
    data: data
  })
}

// 用户是否能够开卡
export function checkEligibility(idCard) {
  return request({
    url: '/nacs/cards/check-eligibility?idCard=' + idCard,
    method: 'get'
  })
}

// 获取门禁卡的线路信息
export function getLineInfo(data) {
  return request({
    url: '/nacs/cards/cards-info',
    method: 'post',
    data: data
  })
}