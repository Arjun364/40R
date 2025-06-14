// stores/auth.js
import { ref, computed } from 'vue'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/Config/firebase'

const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true')
const userClaims = ref(null)
const currentUser = ref(null)

export const useAuthStore = () => {
  // Listen for auth state changes and get custom claims
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user
      try {
        // Get the ID token to access custom claims
        const idTokenResult = await user.getIdTokenResult()
        userClaims.value = idTokenResult.claims
        
        // Check if user has required permissions
        console.log('User claims:', idTokenResult.claims)
        
        if (!idTokenResult.claims.admin && !idTokenResult.claims.serviceProvider) {
          console.warn('User lacks required permissions (admin or serviceProvider)')
        }
      } catch (error) {
        console.error('Error getting user claims:', error)
      }
    } else {
      currentUser.value = null
      userClaims.value = null
    }
  })

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      if (userCredential.user) {
        // Get fresh token with claims
        const idTokenResult = await userCredential.user.getIdTokenResult()
        userClaims.value = idTokenResult.claims
        
        localStorage.setItem('isAuthenticated', 'true')
        isAuthenticated.value = true
        
        return {
          success: true,
          user: userCredential.user,
          claims: idTokenResult.claims
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      localStorage.setItem('isAuthenticated', 'false')
      isAuthenticated.value = false
      userClaims.value = null
      currentUser.value = null
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const refreshToken = async () => {
    if (currentUser.value) {
      try {
        const idTokenResult = await currentUser.value.getIdTokenResult(true) // Force refresh
        userClaims.value = idTokenResult.claims
        return idTokenResult.claims
      } catch (error) {
        console.error('Error refreshing token:', error)
        throw error
      }
    }
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isAdmin: computed(() => userClaims.value?.admin === true),
    isServiceProvider: computed(() => userClaims.value?.serviceProvider === true),
    userClaims: computed(() => userClaims.value),
    currentUser: computed(() => currentUser.value),
    login,
    logout,
    refreshToken
  }
}