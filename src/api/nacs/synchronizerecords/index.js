import request from '@/utils/request'

export function getSynchronizeAuthRecords(query) {
  return request({
    url: '/nacs/sync-records/auth',
		method: 'get',
		params: query
  })
}

export function getSynchronizeCardsRecords(query) {
  return request({
    url: '/nacs/sync-records/card',
		method: 'get',
		params: query
  })
}

export function getSynchronizeDeviceRecords(query) {
  return request({
    url: '/nacs/sync-records/device',
		method: 'get',
		params: query
  })
}

export function getSynchronizeGroupRecords(query) {
  return request({
    url: '/nacs/sync-records/group',
		method: 'get',
		params: query
  })
}

export function getSynchronizeGroupEquipRecords(query) {
  return request({
    url: '/nacs/sync-records/group-equip',
		method: 'get',
		params: query
  })
}
