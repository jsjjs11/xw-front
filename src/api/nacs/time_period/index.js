import request from '@/utils/request'

// 创建门禁时间段
export function createTimePeriod(data) {
  return request({
    url: '/nacs/time-period/create',
    method: 'post',
    data: data
  })
}

// 更新门禁时间段
export function updateTimePeriod(data) {
  return request({
    url: '/nacs/time-period/update',
    method: 'put',
    data: data
  })
}

// 删除门禁时间段
export function deleteTimePeriod(id) {
  return request({
    url: '/nacs/time-period/delete?id=' + id,
    method: 'delete'
  })
}

// 获得门禁时间段
export function getTimePeriod(id) {
  return request({
    url: '/nacs/time-period/get?id=' + id,
    method: 'get'
  })
}

// 获得门禁时间段分页
export function getTimePeriodPage(params) {
  return request({
    url: '/nacs/time-period/page',
    method: 'get',
    params
  })
}

// 导出门禁时间段 Excel
export function exportTimePeriodExcel(params) {
  return request({
    url: '/nacs/time-period/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}