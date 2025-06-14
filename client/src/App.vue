<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth' 
import image from './assets/logo.svg'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, isAuthLoading, logout: authLogout } = useAuthStore()

const showNavigation = computed(() => {
  if (route.name === 'login') return false
  return isAuthenticated.value || isAuthLoading.value
})
const currentRoute = computed(() => route.name)
console.log("isAuthenticated", isAuthenticated.value)

const logout = async () => {
  await authLogout()
  await router.push({
    name: 'login',
    path: '/login'
  })
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Navigation Sidebar -->
    <nav v-if="showNavigation" class="md:w-[250px] w-[70px] bg-gray-800 text-white p-4 flex flex-col">
      <div class="flex items-center py-4 mb-8">
        <img alt="Logo" class="mr-4" src="@/assets/logo.svg" width="40" height="40" />
        <h1 class="text-lg font-normal hidden md:block">App Name</h1>
      </div>
      <!-- Skeleton loader for navigation items -->
      <div v-if="isAuthLoading" class="flex-1">
        <div v-for="n in 3" :key="n" class="px-4 py-3 mb-2">
          <div class="h-8 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <!-- Actual navigation items -->
      <div v-else class="flex-1">
        <RouterLink to="/dashboard" class="flex items-center px-4 py-3 text-white no-underline rounded-lg mb-2 hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/dashboard' }">
          <span class="ml-2 hidden md:block">Dashboard</span>
        </RouterLink>
        <RouterLink to="/branches" class="flex items-center px-4 py-3 text-white no-underline rounded-lg mb-2 hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/branches' }">
          <span class="ml-2 hidden md:block">Branches</span>
        </RouterLink>
        <RouterLink to="/services" class="flex items-center px-4 py-3 text-white no-underline rounded-lg mb-2 hover:bg-gray-700 transition-colors" :class="{ 'bg-gray-700': $route.path === '/services' }">
          <span class="ml-2 hidden md:block">Services</span>
        </RouterLink>
      </div>
      <!-- Skeleton loader for logout button -->
      <div v-if="isAuthLoading" class="py-4">
        <div class="w-full h-12 bg-gray-700 rounded-lg animate-pulse"></div>
      </div>
      <!-- Actual logout button -->
      <div v-else class="py-4">
        <button @click="logout"
                class="w-full py-3 px-4 bg-red-600 text-white border-none rounded-lg cursor-pointer hover:bg-red-700 transition-colors">
          <span class="hidden md:inline">Logout</span>
          <span class="md:hidden">×</span>
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
            <span>name</span>
            <img :src="image" class="w-10 h-10" alt="user image">
          </div>
        </template>
      </div>
      <RouterView />
    </main>
  </div>
</template>