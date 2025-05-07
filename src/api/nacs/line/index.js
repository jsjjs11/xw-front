import request from '@/utils/request'

// 创建线路信息
export function createLines(data) {
  return request({
    url: '/nacs/lines/create',
    method: 'post',
    data: data
  })
}

// 更新线路信息
export function updateLines(data) {
  return request({
    url: '/nacs/lines/update',
    method: 'put',
    data: data
  })
}

// 删除线路信息
export function deleteLines(id) {
  return request({
    url: '/nacs/lines/delete?id=' + id,
    method: 'delete'
  })
}

// 获得线路信息
export function getLines(id) {
  return request({
    url: '/nacs/lines/get?id=' + id,
    method: 'get'
  })
}

// 获得线路信息分页
export function getLinesPage(params) {
  return request({
    url: '/nacs/lines/page',
    method: 'get',
    params
  })
}
// 导出线路信息 Excel
export function exportLinesExcel(params) {
  return request({
    url: '/nacs/lines/export-excel',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function listSimpleLineDatas() {
  return request({
    url: '/nacs/lines/list-all-simple',
    method: 'get',
  })
}
