/*
 * @copyright: 2021 NANJING SAC Rail Traffic Engineering CO., LTD
 * @Descripttion: 
 * @version: V1.0
 * @Author: ym
 * @Date: 2025-06-30 09:02:39
 * @LastEditors: ym
 * @LastEditTime: 2025-06-30 09:03:23
 */
import request from '@/utils/request'
export function statistics() {
	return request({
		url: '/nacs/dashboard/statistics',
		method: 'get'
	})
}