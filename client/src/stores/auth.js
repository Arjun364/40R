// Enhanced stores/auth.js
import { ref, computed } from 'vue'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/Config/firebase'

// Core auth state
const isAuthenticated = ref(false)
const isAuthLoading = ref(true) // Add loading state
const userClaims = ref(null)
const currentUser = ref(null)

// Enhanced user data storage
const userProfile = ref(null) // Complete user profile from Firestore
const userPreferences = ref(null) // User settings/preferences

export const useAuthStore = () => {
  
  // Enhanced auth state change handler
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user
      
      try {
        // Get custom claims
        const idTokenResult = await user.getIdTokenResult()
        userClaims.value = idTokenResult.claims
        
        // Fetch complete user profile from Firestore
        await fetchUserProfile(user.uid)
        
        // Load user preferences
        loadUserPreferences(user.uid)
        
        isAuthenticated.value = true
        
      } catch (error) {
        console.error('Error getting user data:', error)
      } finally {
        isAuthLoading.value = false
        console.error('Error getting user data:', error)
      }
    } else {
      // Clear all user data on logout
      clearUserData()
      isAuthLoading.value = false
    }
  })

  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    console.log(userId,"userId");
    
    try {
      const userDoc = await getDoc(doc(db, 'admin', "NPGZx8AGRXePGkzpLDNP2l8XXw12"))
      console.log(userDoc,"userDoc");
      
      if (userDoc.exists()) {
        userProfile.value = userDoc.data()
        
        // Store essential data in localStorage for quick access
        localStorage.setItem('userProfile', JSON.stringify(userDoc.data()))
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // Load user preferences from localStorage
  const loadUserPreferences = (userId) => {
    const stored = localStorage.getItem(`preferences_${userId}`)
    if (stored) {
      userPreferences.value = JSON.parse(stored)
    } else {
      // Set default preferences
      userPreferences.value = {
        theme: 'light',
        language: 'en',
        notifications: true
      }
    }
  }

  // Save user preferences to localStorage
  const saveUserPreferences = (preferences) => {
    if (currentUser.value) {
      userPreferences.value = preferences
      localStorage.setItem(`preferences_${currentUser.value.uid}`, JSON.stringify(preferences))
    }
  }

  // Enhanced login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      if (userCredential.user) {
        // Get fresh token with claims
        const idTokenResult = await userCredential.user.getIdTokenResult()
        userClaims.value = idTokenResult.claims
        
        // Fetch user profile
        await fetchUserProfile(userCredential.user.uid)
        
        // Load preferences
        loadUserPreferences(userCredential.user.uid)
        
        isAuthenticated.value = true
        
        return {
          success: true,
          user: userCredential.user,
          claims: idTokenResult.claims,
          profile: userProfile.value
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Clear all user data
  const clearUserData = () => {
    currentUser.value = null
    userClaims.value = null
    userProfile.value = null
    userPreferences.value = null
    isAuthenticated.value = false
    
    // Clear localStorage
    localStorage.removeItem('userProfile')
    localStorage.removeItem('isAuthenticated')
  }

  // Enhanced logout
  const logout = async () => {
    try {
      await signOut(auth)
      clearUserData()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (currentUser.value && userProfile.value) {
      try {
        // Update in Firestore
        await updateDoc(doc(db, 'users', currentUser.value.uid), updates)
        
        // Update local state
        userProfile.value = { ...userProfile.value, ...updates }
        
        // Update localStorage
        localStorage.setItem('userProfile', JSON.stringify(userProfile.value))
        
        return true
      } catch (error) {
        console.error('Error updating profile:', error)
        throw error
      }
    }
  }

  return {
    // Auth state
    isAuthenticated: computed(() => isAuthenticated.value),
    isAuthLoading: computed(() => isAuthLoading.value),
    isAdmin: computed(() => userClaims.value?.admin === true),
    isServiceProvider: computed(() => userClaims.value?.serviceProvider === true),
    
    // User data
    currentUser: computed(() => currentUser.value),
    userClaims: computed(() => userClaims.value),
    userProfile: computed(() => userProfile.value),
    userPreferences: computed(() => userPreferences.value),
    
    // Computed user info for easy access
    userName: computed(() => userProfile.value?.name || currentUser.value?.email || 'User'),
    userEmail: computed(() => currentUser.value?.email),
    userRole: computed(() => {
      if (userClaims.value?.admin) return 'Admin'
      if (userClaims.value?.serviceProvider) return 'Service Provider'
      return 'User'
    }),
    
    // Functions
    login,
    logout,
    updateUserProfile,
    saveUserPreferences,
    fetchUserProfile
  }
}