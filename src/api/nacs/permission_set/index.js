/*
 * @copyright: 2021 NANJING SAC Rail Traffic Engineering CO., LTD
 * @Descripttion:
 * @version: V1.0
 * @Author: ym
 * @Date: 2025-04-10 19:09:02
 * @LastEditors: ym
 * @LastEditTime: 2025-05-27 10:22:18
 */
import request from '@/utils/request'

// 创建权限集
export function createPermissionSet(data) {
  return request({
    url: '/nacs/permission-set/create',
    method: 'post',
    data: data
  })
}

// 更新权限集
export function updatePermissionSet(data) {
  return request({
    url: '/nacs/permission-set/update',
    method: 'put',
    data: data
  })
}

// 删除权限集
export function deletePermissionSet(id) {
  return request({
    url: '/nacs/permission-set/delete?id=' + id,
    method: 'delete'
  })
}

// 获取权限集
export function getPermissionSet(id) {
  return request({
    url: '/nacs/permission-set/get?id=' + id,
    method: 'get'
  })
}

// 获取权限集分页
export function getPermissionSetPage(query) {
  return request({
    url: '/nacs/permission-set/page',
    method: 'get',
    params: query
  })
}




// 创建权限集详情
export function createPermissionSetDetail(data) {
  return request({
    url: '/nacs/permission-set/save-permition-set-detail',
    method: 'post',
    data: data
  })
}

// 更新权限集详情
export function updatePermissionSetDetail(data) {
  return request({
    url: '/nacs/permission-set-detail/update',
    method: 'put',
    data: data
  })
}


// 删除权限集详情
export function deletePermissionSetDetail(id) {
  return request({
    url: '/nacs/permission-set-detail/delete?id=' + id,
    method: 'delete'
  })
}


// 获取权限集详情
export function getPermissionSetDetail(id) {
  return request({
    url: '/nacs/permission-set-detail/get?id=' + id,
    method: 'get'
  })
}


// 获取权限集详情分页
export function getPermissionSetDetailPage(query) {
  return request({
    url: '/nacs/permission-set/permission-set-detail-page',
    method: 'get',
    params: query
  })
}
// 获取权限集详情分页
export function getPermissionSetDetailList(setCode) {
  return request({
    url: '/nacs/permission-set/permission-set-detail-list?setCode=' + setCode,
    method: 'get'
  })
}


export function getDevice(query) {
  return request({
    url: '/nacs/card-permissions/groups-or-devices',
    method: 'get',
    params: query
  })
}
