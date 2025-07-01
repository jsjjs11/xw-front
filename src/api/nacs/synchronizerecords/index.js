import request from '@/utils/request'

export function getSynchronizeAuthRecords(query) {
  return request({
    url: '/nacs/synchronizeauthrecords/page',
		method: 'get',
		params: query
  })
}

export function getSynchronizeCardsRecords(query) {
  return request({
    url: '/nacs/synchronizecardrecords/page',
		method: 'get',
		params: query
  })
}

export function getSynchronizeDeviceRecords(query) {
  return request({
    url: '/nacs/synchronizedevicerecords/page',
		method: 'get',
		params: query
  })
}

export function getSynchronizeGroupRecords(query) {
  return request({
    url: '/nacs/synchronizegrouprecords/page',
		method: 'get',
		params: query
  })
}

export function getSynchronizeGroupEquipRecords(query) {
  return request({
    url: '/nacs/synchronizegroupequiprecords/page',
		method: 'get',
		params: query
  })
}
