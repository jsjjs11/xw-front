/*
 * @copyright: 2021 NANJING SAC Rail Traffic Engineering CO., LTD
 * @Descripttion: 
 * @version: V1.0
 * @Author: ym
 * @Date: 2025-04-10 19:09:02
 * @LastEditors: ym
 * @LastEditTime: 2025-04-10 19:26:01
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