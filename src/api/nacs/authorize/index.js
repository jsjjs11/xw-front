import request from '@/utils/request'

// 创建门禁权限授权操作列
export function createCardPermissionsList(data) {
  return request({
    url: '/nacs/card-permissions/create',
    method: 'post',
    data: data
  })
}

// 更新门禁权限授权操作列
export function updateCardPermissionsList(data) {
  return request({
    url: '/nacs/card-permissions/update',
    method: 'put',
    data: data
  })
}

// 删除门禁权限授权操作列
export function deleteCardPermissionsList(id) {
  return request({
    url: '/nacs/card-permissions/delete?id=' + id,
    method: 'delete'
  })
}

// 获得门禁权限授权操作列
export function getCardPermissionsList(id) {
  return request({
    url: '/nacs/card-permissions/get?id=' + id,
    method: 'get'
  })
}

// 获得门禁权限授权操作列分页
export function getCardPermissionsListPage(params) {
  return request({
    url: '/nacs/card-permissions/page',
    method: 'get',
    params
  })
}
// 导出门禁权限授权操作列 Excel
export function exportCardPermissionsListExcel(params) {
  return request({
    url: '/nacs/card-permissions/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
// 查询车站站点的门禁点和门禁权限组
export function getGroupsOrDevicesList(id) {
  return request({
    url: '/nacs/card-permissions/groups-or-devices?lineNo=' + id,
    method: 'get'
  })
}