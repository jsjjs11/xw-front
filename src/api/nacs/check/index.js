import request from '@/utils/request'
/**
 * 获取审核详情
 * @param {string} checkId 审核单号
 */

// 获得线路信息分页
export function getCheckPage(params) {
  return request({
    url: '/nacs/permissions/page',
    method: 'get',
    params
  })
}

export function getCheckDetail(authNo) {
  return request({
    url: '/nacs/permissions/list-waiting-review?authNo=' + authNo,
    method: 'get'
  })
}

export function reviewCheck(data) {
  return request({
    url: '/nacs/permissions/review',
    method: 'post',
    data: data
  })
}