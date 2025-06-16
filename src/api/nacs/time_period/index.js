/*
 * @copyright: 2021 NANJING SAC Rail Traffic Engineering CO., LTD
 * @Descripttion: 
 * @version: V1.0
 * @Author: ym
 * @Date: 2025-04-15 16:22:46
 * @LastEditors: ym
 * @LastEditTime: 2025-06-16 15:14:07
 */
import request from '@/utils/request'

// 获得门禁时间段
export function getTimePeriod(lineNo) {
  return request({
    url: '/nacs/time-rule/list-all-simple?lineNo=' + lineNo,
    method: 'get'
  })
}
export function getTimePeriodAll() {
  return request({
    url: '/nacs/time-rule/get-all-time-rule',
    method: 'get'
  })
}
// 创建权限集详情
export function createTimePeriod(data) {
  return request({
    url: '/nacs/time-rule/save-time-period',
    method: 'post',
    data: data
  })
}