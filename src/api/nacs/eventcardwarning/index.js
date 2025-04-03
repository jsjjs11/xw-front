import request from '@/utils/request'

// 创建该表存储员工门禁告警事件相关信息
export function createEventCardWarning(data) {
  return request({
    url: '/nacs/event-card-warning/create',
    method: 'post',
    data: data
  })
}

// 更新该表存储员工门禁告警事件相关信息
export function updateEventCardWarning(data) {
  return request({
    url: '/nacs/event-card-warning/update',
    method: 'put',
    data: data
  })
}

// 删除该表存储员工门禁告警事件相关信息
export function deleteEventCardWarning(id) {
  return request({
    url: '/nacs/event-card-warning/delete?id=' + id,
    method: 'delete'
  })
}

// 获得该表存储员工门禁告警事件相关信息
export function getEventCardWarning(id) {
  return request({
    url: '/nacs/event-card-warning/get?id=' + id,
    method: 'get'
  })
}

// 获得该表存储员工门禁告警事件相关信息分页
export function getEventCardWarningPage(params) {
  return request({
    url: '/nacs/event-card-warning/page',
    method: 'get',
    params
  })
}
// 导出该表存储员工门禁告警事件相关信息 Excel
export function exportEventCardWarningExcel(params) {
  return request({
    url: '/nacs/event-card-warning/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}