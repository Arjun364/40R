<script setup>
import { ref, reactive, onMounted } from 'vue'
import { db } from '@/Config/firebase'
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Reactive state
const isLoading = ref(false)
const isFetching = ref(false)
const isSubmitting = ref(false)
const showCreateForm = ref(false)
const showEditForm = ref(false)
const showDeleteConfirm = ref(false)
const branchToDelete = ref(null)
const branchToEdit = ref(null)
const branches = ref([])
const availableServices = ref([])
const servicesMap = ref({}) // Map to store service details by ID

// New branch form data
const newBranch = reactive({
  name: '',
  location: '',
  selectedServiceIds: [], // Changed to store IDs instead of names
  slots: {
    morning: 0,
    noon: 0,
    evening: 0
  }
})

// Methods
const checkBranchNameExists = (name, excludeBranchId = null) => {
  return branches.value.some(branch =>
    branch.name.toLowerCase() === name.toLowerCase() &&
    branch.id !== excludeBranchId
  )
}

const loadData = async () => {
  isLoading.value = true
  try {
    await Promise.all([fetchServices(), fetchBranches()])
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchBranches = async () => {
  isFetching.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'branches'))
    branches.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      const services = data.serviceIds.map(serviceId => servicesMap.value[serviceId])
      return {
        id: doc.id,
        name: data.name,
        location: data.location,
        services: services,
        slots: data.slots,
        createdAt: data.createdAt
      }
    })
  } catch (error) {
    console.error('Error fetching branches:', error)
    toast.error('Error loading branches. Please try again.')
  } finally {
    isFetching.value = false
  }
}

const fetchServices = async () => {
  servicesMap.value = {} // Reset map before fetching
  try {
    const querySnapshot = await getDocs(collection(db, 'services'))
    const services = querySnapshot.docs.map(doc => {
      const service = doc.data()
      return {
        id: doc.id,
        name: service.name,
        type: service.type,
        badgeClass: getServiceBadgeClass(service.type)
      }
    })
    
    // Update available services
    availableServices.value = services
    
    // Create a map of service details by ID
    servicesMap.value = services.reduce((acc, service) => {
      acc[service.id] = service
      return acc
    }, {})
    
  } catch (error) {
    console.error('Error fetching services:', error)
    toast.error('Error loading services. Please try again.')
  }
}

const createBranch = async () => {
  if (newBranch.name && newBranch.location && newBranch.selectedServiceIds.length > 0) {
    if (checkBranchNameExists(newBranch.name)) {
      toast.error('A branch with this name already exists')
      return
    }
    isSubmitting.value = true
    try {
      const branch = {
        name: newBranch.name,
        location: newBranch.location,
        serviceIds: [...newBranch.selectedServiceIds],
        slots: { ...newBranch.slots },
        createdAt: new Date()
      }
      
      await addDoc(collection(db, 'branches'), branch)
      // Refresh the branches list
      await fetchBranches()
      
      closeCreateForm()
      toast.success('Branch created successfully!')
    } catch (error) {
      console.error('Error creating branch:', error)
      toast.error('Error creating branch. Please try again.')
    } finally {
      isSubmitting.value = false
    }
  } else {
    toast.warning('Please fill in all required fields and select at least one service.')
  }
}

const confirmDelete = (branch) => {
  branchToDelete.value = branch
  showDeleteConfirm.value = true
}

const deleteBranch = async () => {
  try {
    await deleteDoc(doc(db, 'branches', branchToDelete.value.id))
    // Remove the branch from local state
    branches.value = branches.value.filter(branch => branch.id !== branchToDelete.value.id)
    toast.success('Branch deleted successfully!')
    showDeleteConfirm.value = false
    branchToDelete.value = null
  } catch (error) {
    console.error('Error deleting branch:', error)
    toast.error('Error deleting branch. Please try again.')
  }
}

const openCreateForm = () => {
  console.log('Opening create form...')
  showCreateForm.value = true
}

const openEditForm = (branch) => {
  branchToEdit.value = {
    id: branch.id,
    name: branch.name,
    location: branch.location,
    selectedServiceIds: branch.services.filter(service => service).map(service => service.id),
    slots: {
      morning: parseInt(branch.slots.morning) || 0,
      noon: parseInt(branch.slots.noon) || 0,
      evening: parseInt(branch.slots.evening) || 0
    }
  }
  showEditForm.value = true
}

const closeEditForm = () => {
  showEditForm.value = false
  branchToEdit.value = null
}

const updateBranch = async () => {
  if (branchToEdit.value.name && branchToEdit.value.location && branchToEdit.value.selectedServiceIds.length > 0) {
    if (checkBranchNameExists(branchToEdit.value.name, branchToEdit.value.id)) {
      toast.error('A branch with this name already exists')
      return
    }
    isSubmitting.value = true
    try {
      const branchRef = doc(db, 'branches', branchToEdit.value.id)
      
      // Filter out any null/undefined values in selectedServiceIds
      const validServiceIds = branchToEdit.value.selectedServiceIds.filter(Boolean)
      
      const updatedBranch = {
        name: branchToEdit.value.name,
        location: branchToEdit.value.location,
        serviceIds: validServiceIds,
        slots: {
          morning: parseInt(branchToEdit.value.slots.morning) || 0,
          noon: parseInt(branchToEdit.value.slots.noon) || 0,
          evening: parseInt(branchToEdit.value.slots.evening) || 0
        }
      }

      await updateDoc(branchRef, updatedBranch)
      await fetchBranches()
      
      closeEditForm()
      toast.success('Branch updated successfully!')
    } catch (error) {
      console.error('Error updating branch:', error)
      toast.error('Error updating branch. Please try again.')
    } finally {
      isSubmitting.value = false
    }
  } else {
    toast.warning('Please fill in all required fields and select at least one service.')
  }
}

const closeCreateForm = () => {
  showCreateForm.value = false
  // Reset form
  Object.assign(newBranch, {
    name: '',
    location: '',
    selectedServiceIds: [],
    slots: { morning: 0, noon: 0, evening: 0 }
  })
}

const getServiceBadgeClass = (type) => {
  const typeMap = {
    'basic': 'bg-blue-100 text-blue-800',
    'premium': 'bg-green-100 text-green-800',
    'deluxe': 'bg-purple-100 text-purple-800'
  }
  return typeMap[type.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

// Load data when component mounts
onMounted(loadData)
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-[90vh] overflow-y-scroll">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900">Branch Management</h1>
      </div>
      <button 
        @click="openCreateForm"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Create Branch
      </button>
    </div>

    <!-- All Branches Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl fontopenEditForm-semibold text-gray-900">All Branches</h2>
        <p class="text-gray-600 mt-1">Manage your branch locations and services</p>
      </div>
      
            <!-- Loading State -->
            <div v-if="isLoading || isFetching" class="px-6 py-12">
        <div class="flex flex-col items-center justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Loading branches...</p>
        </div>
      </div>

      <!-- No Records State -->
      <div v-else-if="branches.length === 0" class="px-6 py-12">
        <div class="flex flex-col items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No branches found</h3>
          <p class="mt-1 text-gray-600">Get started by creating your first branch</p>
        </div>
      </div>

      <!-- Branch List -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slots</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="branch in branches" :key="branch.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ branch.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ branch.location }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="service in branch.services"
                    :key="service?.id"
                    :class="service?.badgeClass"
                    class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ service?.name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="space-y-1">
                  <div>Morning: {{ branch.slots.morning }}</div>
                  <div>Noon: {{ branch.slots.noon }}</div>
                  <div>Evening: {{ branch.slots.evening }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex gap-4">
                  <button
                    @click="openEditForm(branch)"
                    class="text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(branch)"
                    class="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Branch Modal -->
    <div v-if="showCreateForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold text-gray-900">Create New Branch</h3>
            <button 
              @click="closeCreateForm"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="createBranch" class="p-6 space-y-6">
          <!-- Branch Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
            <input 
              v-model="newBranch.name"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter branch name"
            />
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input 
              v-model="newBranch.location"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter branch location"
            />
          </div>

          <!-- Services -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Available Services</label>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="service in availableServices" :key="service.id" class="flex items-center">
                <input
                  :id="service.id"
                  v-model="newBranch.selectedServiceIds"
                  :value="service.id"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label :for="service.id" class="ml-2 text-sm text-gray-700">
                  {{ service.name }}
                  <span :class="service.badgeClass" class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ service.type }}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Slot Configuration -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Slot Configuration</label>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Morning Slots</label>
                <input 
                  v-model.number="newBranch.slots.morning"
                  type="number" 
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Noon Slots</label>
                <input 
                  v-model.number="newBranch.slots.noon"
                  type="number" 
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Evening Slots</label>
                <input 
                  v-model.number="newBranch.slots.evening"
                  type="number" 
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button"
              @click="closeCreateForm"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
              {{ isSubmitting ? 'Creating...' : 'Create Branch' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Branch</h3>
          <p class="text-gray-600">
            Are you sure you want to delete branch "{{ branchToDelete?.name }}"? This action cannot be undone.
          </p>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="deleteBranch"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Delete Branch
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Branch Modal -->
  <div v-if="showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold text-gray-900">Edit Branch</h3>
          <button
            @click="closeEditForm"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="updateBranch" class="p-6 space-y-6">
        <!-- Branch Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
          <input
            v-model="branchToEdit.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter branch name"
          />
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            v-model="branchToEdit.location"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter branch location"
          />
        </div>

        <!-- Services -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Available Services</label>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="service in availableServices" :key="service.id" class="flex items-center">
              <input
                :id="'edit-' + service.id"
                v-model="branchToEdit.selectedServiceIds"
                :value="service.id"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label :for="'edit-' + service.id" class="ml-2 text-sm text-gray-700">
                {{ service.name }}
                <span :class="service.badgeClass" class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ service.type }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <!-- Slot Configuration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Slot Configuration</label>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Morning Slots</label>
              <input
                v-model.number="branchToEdit.slots.morning"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Noon Slots</label>
              <input
                v-model.number="branchToEdit.slots.noon"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Evening Slots</label>
              <input
                v-model.number="branchToEdit.slots.evening"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="closeEditForm"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
