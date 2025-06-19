import request from '@/utils/request'
// 部门权限列表分页
export function deptPermissionPage(params) {
	return request({
		url: '/nacs/dept-permissions/page',
		method: 'get',
		params: params
	})
}
// 获取部门权限
export function getdeptPermission(deptId) {
	return request({
		url: '/nacs/dept-permissions/get?deptId=' + deptId,
		method: 'get'
	})
}

// 新增部门权限
export function createdeptPermission(data) {
	return request({
		url: '/nacs/dept-permissions/create',
		method: 'post',
		data: data
	})
}

