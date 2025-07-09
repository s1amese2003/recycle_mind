import request from '@/utils/request'

// --- 生产计划 API ---

export function getProductionPlans(params) {
  return request({
    url: '/production/plan/list',
    method: 'get',
    params
  })
}

export function addProductionPlan(data) {
  return request({
    url: '/production/plan',
    method: 'post',
    data
  })
}

export function updateProductionPlan(id, data) {
  return request({
    url: `/production/plan/${id}`,
    method: 'put',
    data
  })
}

export function deleteProductionPlan(id) {
  return request({
    url: `/production/plan/${id}`,
    method: 'delete'
  })
}

// --- 生产记录 API ---

export function getProductionRecords(params) {
  return request({
    url: '/production/record/list',
    method: 'get',
    params
  })
}

export function addProductionRecord(data) {
  return request({
    url: '/production/record',
    method: 'post',
    data
  })
}

export function updateProductionRecord(id, data) {
  return request({
    url: `/production/record/${id}`,
    method: 'put',
    data
  })
}

export function deleteProductionRecord(id) {
  return request({
    url: `/production/record/${id}`,
    method: 'delete'
  })
}
