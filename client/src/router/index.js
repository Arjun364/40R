import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/Config/firebase'
import LoginView from '@/views/Auth/Login.vue'
import DashboardView from '@/views/Dashboard/DashboardView.vue'
import BranchesView from '@/views/Branches/BranchesView.vue'
import ServicesView from '@/views/Services/ServicesView.vue'
import BookingsView from '@/views/Bookings/BookingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/branches',
      name: 'branches',
      component: BranchesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/services',
      name: 'services',
      component: ServicesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: BookingsView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    if (to.meta.requiresAuth && !user) {
      // If route requires auth and user is not logged in, redirect to login
      next('/login')
    } else if (to.path === '/login' && user) {
      // If trying to access login while logged in, redirect to dashboard
      next('/dashboard')
    } else {
      next()
    }
    unsubscribe()
  })
})

export default router
