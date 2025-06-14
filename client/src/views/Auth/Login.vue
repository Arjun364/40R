<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Adjust path as needed

const router = useRouter()
const { login: authLogin } = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = () => {
  // Basic validation
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  // TODO: Replace with actual authentication API call
  if (email.value === 'admin@example.com' && password.value === 'admin') {
    authLogin() // This will update both localStorage and reactive state
    router.push('/dashboard')
  } else {
    error.value = 'Invalid credentials'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <div class="text-center mb-8">
        <img alt="Logo" class="mx-auto" src="@/assets/logo.svg" width="50" height="50" />
        <h1 class="text-2xl font-semibold mt-4 mb-2 text-gray-800">Welcome Back</h1>
        <p class="text-gray-600">Please sign in to continue</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm text-gray-800">Email</label>
          <input 
            id="email"
            type="email" 
            v-model="email"
            placeholder="Enter your email"
            required
            class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          >
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-sm text-gray-800">Password</label>
          <input 
            id="password"
            type="password" 
            v-model="password"
            placeholder="Enter your password"
            required
            class="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          >
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <button type="submit" 
                class="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Sign In
        </button>

        <div class="mt-6 text-center space-y-1">
          <p class="text-gray-600 text-sm">Demo credentials:</p>
          <p class="text-gray-600 text-sm">Email: admin@example.com</p>
          <p class="text-gray-600 text-sm">Password: admin</p>
        </div>
      </form>
    </div>
  </div>
</template>