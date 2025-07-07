/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const recycleRouter = {
  path: '/recycle',
  component: Layout,
  redirect: '/recycle/dashboard',
  name: 'Recycle',
  meta: {
    title: '废料回收管理',
    icon: 'tree',
    roles: ['admin', 'operator'] // 设置角色权限
  },
  children: [
    {
      path: 'dashboard',
      component: () => import('@/views/recycle/dashboard/index'),
      name: 'RecycleDashboard',
      meta: { title: '管理仪表盘', icon: 'dashboard' }
    },
    {
      path: 'waste-material',
      component: () => import('@/views/recycle/waste-material/index'),
      name: 'WasteMaterial',
      meta: { title: '废料库存管理', icon: 'list' }
    },
    {
      path: 'recipe',
      component: () => import('@/views/recycle/recipe/index'),
      name: 'Recipe',
      meta: { title: '配方计算', icon: 'edit' }
    },
    {
      path: 'production',
      component: () => import('@/views/recycle/production/index'),
      name: 'Production',
      meta: { title: '生产管理', icon: 'form' }
    },
    {
      path: 'report',
      component: () => import('@/views/recycle/report/index'),
      name: 'Report',
      meta: { title: '统计报表', icon: 'chart' }
    }
  ]
}

export default recycleRouter
