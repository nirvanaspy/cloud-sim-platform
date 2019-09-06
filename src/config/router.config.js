// eslint-disable-next-line
/* eslint-disable */

import {
  UserLayout,
  BasicLayout,
  RouteView,
  BlankLayout,
  PageView
} from '@/layouts'

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/simApplication',
    children: [
      // simulation application
      {
        path: '/simApplication',
        name: 'simApplication',
        component: () => import('@/views/SimApplication/SimApplication'),
        meta: {
          title: '仿真应用',
          keepAlive: true,
          icon: 'appstore',
          permission: ['simApplication']
        }
      },
      // components
      {
        path: '/components/index',
        name: 'components',
        component: RouteView,
        meta: {
          title: '组件',
          keepAlive: true,
          icon: 'table',
          permission: ['dashboard']
        },
        children: [
          {
            path: '/components/index',
            name: 'components',
            component: () => import('@/views/Components/Components'),
            meta: {
              title: '组件列表',
              keepAlive: true,
              permission: ['simApplication']
            }
          },
          {
            path: '/components/detail',
            name: 'ComponentDetail',
            component: () => import('@/views/Components/ComponentDetail'),
            meta: {
              title: '组件详情',
              keepAlive: true,
              permission: ['simApplication']
            }
          }
        ]
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () =>
          import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () =>
          import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () =>
          import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      }
    ]
  },

  {
    path: '/404',
    component: () =>
      import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
