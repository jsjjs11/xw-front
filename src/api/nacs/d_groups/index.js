/*
 * @copyright: 2021 NANJING SAC Rail Traffic Engineering CO., LTD
 * @Descripttion: 
 * @version: V1.0
 * @Author: ym
 * @Date: 2025-04-15 10:47:05
 * @LastEditors: ym
 * @LastEditTime: 2025-04-15 11:40:25
 */
import request from '@/utils/request'

// 获取门禁组列表
export function getDGroupList(query) {
  return request({
    url: '/nacs/d-groups/list',
    method: 'get',
    params: query
  })
}

// 获取门禁组详情
export function getDGroup(id) {
  return request({
    url: '/nacs/d-groups/get?id=' + id,
    method: 'get'
  })
}

// 新增门禁组
export function createDGroup(data) {
  return request({
    url: '/nacs/d-groups/create',
    method: 'post',
    data: data
  })
}

// 修改门禁组
export function updateDGroup(data) {
  return request({
    url: '/nacs/d-groups/update',
    method: 'put',
    data: data
  })
}

// 删除门禁组
export function deleteDGroup(id) {
  return request({
    url: '/nacs/d-groups/delete?id=' + id,
    method: 'delete'
  })
}

// 获取门禁组下的门禁点列表
export function getDGroupDevices(groupId) {
  return request({
    url: '/nacs/d-groups/devices?groupId=' + groupId,
    method: 'get'
  })
}
