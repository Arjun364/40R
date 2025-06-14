<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { login: authLogin } = useAuthStore()
const loading = ref(false)

const email = ref('')
const password = ref('')
const error = ref('')

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validatePassword = (password) => {
  return password.length > 0 && password.length <= 10
}

const getFirebaseErrorMessage = (error) => {

  console.log(error.code);
  
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'invalid credentials'
    case 'auth/wrong-password':
      return 'Invalid password'
    case 'auth/invalid-email':
      return 'Invalid email format'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    default:
      return error.message || 'Login failed'
  }
}

const handleLogin = async () => {
  error.value = ''
  
  // Validate email
  if (!validateEmail(email.value)) {
    error.value = 'Please enter a valid email address'
    return
  }

  // Validate password
  if (!validatePassword(password.value)) {
    error.value = 'Password must be between 1 and 10 characters'
    return
  }

  loading.value = true

  try {
    const response = await authLogin(email.value, password.value)
    console.log("response", response);
    
    if (response.success) {
      router.push('/dashboard')
    }
  } catch (e) {
    error.value = getFirebaseErrorMessage(e)
  } finally {
    loading.value = false
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

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors relative"
        >
          <span v-if="loading" class="absolute left-1/2 transform -translate-x-1/2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span :class="{ 'opacity-0': loading }">Sign In</span>
        </button>
        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>
        <div class="mt-6 text-center space-y-1">
          <p class="text-gray-600 text-sm">Demo credentials:</p>
          <p class="text-gray-600 text-sm">Email: admin@example.com</p>
          <p class="text-gray-600 text-sm">Password: admin</p>
        </div>
      </form>
    </div>
  </div>
</template>