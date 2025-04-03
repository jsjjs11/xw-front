import request from '@/utils/request'

// 创建门禁卡通行记录
export function createEventCardRcds(data) {
  return request({
    url: '/nacs/event-card-rcds/create',
    method: 'post',
    data: data
  })
}

// 更新门禁卡通行记录
export function updateEventCardRcds(data) {
  return request({
    url: '/nacs/event-card-rcds/update',
    method: 'put',
    data: data
  })
}

// 删除门禁卡通行记录
export function deleteEventCardRcds(id) {
  return request({
    url: '/nacs/event-card-rcds/delete?id=' + id,
    method: 'delete'
  })
}

// 获得门禁卡通行记录
export function getEventCardRcds(id) {
  return request({
    url: '/nacs/event-card-rcds/get?id=' + id,
    method: 'get'
  })
}

// 获得门禁卡通行记录分页
export function getEventCardRcdsPage(params) {
  return request({
    url: '/nacs/event-card-rcds/page',
    method: 'get',
    params
  })
}
// 导出门禁卡通行记录 Excel
export function exportEventCardRcdsExcel(params) {
  return request({
    url: '/nacs/event-card-rcds/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}