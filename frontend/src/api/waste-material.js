// src/api/waste-material.js
import request from '@/utils/request' // 确保你项目中封装的 axios 路径是这个

/**
 * 获取废料列表
 * @param {object} params - 查询参数，例如 { page: 1, limit: 20, keyword: 'xxx' }
 */
export function getWasteMaterialList(params) {
  return request({
    url: '/waste-material/list', // 这是我们在后端 server.js 中定义的 URL
    method: 'get',
    params // 将查询参数附加到 URL 上
  })
}

/**
 * 新增废料
 * @param {object} data - 废料数据
 */
export function createWasteMaterial(data) {
  return request({
    url: '/waste-material',
    method: 'post',
    data
  })
}

/**
 * 修改废料
 * @param {number} id - 废料ID
 * @param {object} data - 废料数据
 */
export function updateWasteMaterial(id, data) {
  return request({
    url: `/waste-material/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除废料
 * @param {number} id - 废料ID
 */
export function deleteWasteMaterial(id) {
  return request({
    url: `/waste-material/${id}`,
    method: 'delete'
  })
}

// 注意：这里我们使用了命名导出 `export function`，而不是 `export default`
