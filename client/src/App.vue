<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth' 

const route = useRoute()
const router = useRouter()
const { isAuthenticated, logout: authLogout } = useAuthStore()

const showNavigation = computed(() => isAuthenticated.value && route.name !== 'login')

console.log("isAuthenticated", isAuthenticated.value)

const logout = () => {
  authLogout()
  router.push({
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
      <div class="flex-1">
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
      <div class="py-4">
        <button @click="logout"
                class="w-full py-3 px-4 bg-red-600 text-white border-none rounded-lg cursor-pointer hover:bg-red-700 transition-colors">
          <span class="hidden md:inline">Logout</span>
          <span class="md:hidden">×</span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 p-8 bg-gray-50">
      <RouterView />
    </main>
  </div>
</template>