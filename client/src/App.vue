<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed, onMounted ,ref} from 'vue'
import { useAuthStore } from '@/stores/auth' 
import image from './assets/logo.svg'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, isAuthLoading, logout: authLogout } = useAuthStore()
const currentUser = ref()

const showNavigation = computed(() => {
  if (route.name === 'login') return false
  return isAuthenticated.value || isAuthLoading.value
})
const currentRoute = computed(() => route.name)
console.log("isAuthenticated", isAuthenticated.value)

const getCurrentUserData = ()=>{
  currentUser.value = JSON.parse(localStorage.getItem('userProfile'))
}

const logout = async () => {
  await authLogout()
  await router.push({
    name: 'login',
    path: '/login'
  })
}

onMounted(()=>{
  getCurrentUserData()
})
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Navigation Sidebar -->
    <nav v-if="showNavigation" class="md:w-[250px] w-[70px] bg-gray-800 text-white p-4 flex flex-col">
      <div class="flex items-center py-4 mb-8">
        <img alt="Logo" class="mr-4" src="@/assets/logo.svg" width="40" height="40" />
        <h1 class="text-lg font-normal hidden md:block">40R Admin Panel</h1>
      </div>
      <!-- Skeleton loader for navigation items -->
      <div v-if="isAuthLoading" class="flex-1">
        <div v-for="n in 3" :key="n" class="px-4 py-3 mb-2">
          <div class="h-8 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <!-- Actual navigation items -->
      <div v-else class="flex-1">
        <RouterLink to="/dashboard" class="flex items-center justify-center md:justify-start  md:px-4 md: py-3 text-white no-underline rounded-lg mb-2 hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/dashboard' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span class="ml-3 hidden md:block">Dashboard</span>
        </RouterLink>
        <RouterLink to="/branches" class="flex items-center justify-center md:justify-start  md:px-4 md: py-3 text-white no-underline rounded-lg mb-2 hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/branches' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <span class="ml-3 hidden md:block">Branches</span>
        </RouterLink>
        <RouterLink to="/bookings" class="flex items-center justify-center md:justify-start  md:px-4 md: py-3 text-white no-underline rounded-lg mb-2 hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/bookings' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span class="ml-3 hidden md:block">Bookings</span>
        </RouterLink>
        <RouterLink to="/services" class="flex items-center  justify-center md:justify-start  md:px-4 md: py-3 text-white no-underline rounded-lg mb-2 hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/services' }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span class="ml-3 hidden md:block">Services</span>
        </RouterLink>
      </div>
      <!-- Skeleton loader for logout button -->
      <div v-if="isAuthLoading" class="py-4">
        <div class="w-full h-12 bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
      <!-- Actual logout button -->
      <div v-else class="py-4">
        <button @click="logout"
                class="w-full py-3 md:px-4 bg-red-600 text-white border-none rounded-lg cursor-pointer hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="hidden md:inline">Logout</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 px-8 bg-gray-50">
      <div v-if="showNavigation" class="w-full h-[5rem] flex items-center justify-between">
        <div v-if="isAuthLoading" class="flex justify-between w-full">
          <div class="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div class="flex items-center gap-2">
            <div class="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div class="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        <template v-else>
          <div>{{ currentRoute }}</div>
          <div class="flex items-center gap-2">
            <span>{{ currentUser?.username }}</span>
            <img :src="image" class="w-10 h-10" alt="user image">
          </div>
        </template>
      </div>
      <RouterView />
    </main>
  </div>
</template>