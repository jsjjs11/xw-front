import request from '@/utils/request'

// 创建门禁相关设备监控
export function createDevices(data) {
  return request({
    url: '/nacs/devices/create',
    method: 'post',
    data: data
  })
}

// 更新门禁相关设备监控
export function updateDevices(data) {
  return request({
    url: '/nacs/devices/update',
    method: 'put',
    data: data
  })
}

// 删除门禁相关设备监控
export function deleteDevices(id) {
  return request({
    url: '/nacs/devices/delete?id=' + id,
    method: 'delete'
  })
}

// 获得门禁相关设备监控
export function getDevices(id) {
  return request({
    url: '/nacs/devices/get?id=' + id,
    method: 'get'
  })
}

// 获得门禁相关设备监控分页
export function getDevicesPage(params) {
  return request({
    url: '/nacs/devices/page',
    method: 'get',
    params
  })
}
// 导出门禁相关设备监控 Excel
export function exportDevicesExcel(params) {
  return request({
    url: '/nacs/devices/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}