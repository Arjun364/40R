// stores/auth.js
import { ref, computed } from 'vue'

const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true')

export const useAuthStore = () => {
  const login = () => {
    localStorage.setItem('isAuthenticated', 'true')
    isAuthenticated.value = true
  }

  const logout = () => {
    localStorage.setItem('isAuthenticated', 'false')
    isAuthenticated.value = false
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout
  }
}