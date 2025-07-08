import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/console',
    children: [
      {
        path: 'console',
        component: () => import('@/views/dashboard/index'),
        name: 'Console',
        meta: { title: '控制台', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/user/index'),
        name: 'UserManage',
        meta: { title: '用户管理', icon: 'peoples', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/user-login',
    component: () => import('@/views/user/login'),
    hidden: true
  },
  {
    path: '/product',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/views/product/index'),
        name: 'ProductManage',
        meta: { title: '产品管理', icon: 'component', roles: ['admin', 'operator'] }
      }
    ]
  }
]

export const asyncRoutes = [
  {
    path: '/recycle',
    component: Layout,
    redirect: '/recycle/waste-material',
    name: 'Recycle',
    meta: {
      title: '废料回收管理',
      icon: 'recycle',
      roles: ['admin', 'operator']
    },
    children: [
      {
        path: 'waste-material',
        component: () => import('@/views/recycle/waste-material/index'),
        name: 'WasteMaterial',
        meta: { title: '废料库存管理' }
      },
      {
        path: 'recipe',
        component: () => import('@/views/recycle/recipe/index'),
        name: 'Recipe',
        meta: { title: '配方计算' }
      },
      {
        path: 'production',
        component: () => import('@/views/recycle/production/index'),
        name: 'Production',
        meta: { title: '生产管理' }
      },
      {
        path: 'report',
        component: () => import('@/views/recycle/report/index'),
        name: 'Report',
        meta: { title: '统计报表' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user', noCache: true }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
