import request from '@/utils/request'
/**
 * 获取审核详情
 * @param {string} checkId 审核单号
 */

// 获得线路信息分页
export function getCheckPage(params) {
  return request({
    url: '/nacs/check/page',
    method: 'get',
    params
  })
}

export function getCheckDetail(checkId) {
  return request({
    url: '/nacs/check/detail/' + checkId,
    method: 'get'
  })
}