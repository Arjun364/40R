<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { db } from '@/Config/firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Reactive state
const isLoading = ref(true)
const isSaving = ref(false)
const showForm = ref(true)
const searchQuery = ref('')
const services = ref([])
const isEditing = ref(false)
const editingServiceId = ref(null)
const showDeleteConfirm = ref(false)
const serviceToDelete = ref(null)

const newService = reactive({
  name: '',
  type: '',
  price: '',
  description: ''
})

// Computed properties
const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value
  
  return services.value.filter(service =>
    service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const fetchServices = async () => {
  isLoading.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'services'))
    services.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching services:', error)
    toast.error('Failed to load services. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const createService = async () => {
  isSaving.value = true
  if (!newService.name || !newService.type || !newService.price) {
    toast.warning('Please fill in all required fields')
    isSaving.value = false
    return
  }

  // Check if service with same name and type already exists
  const existingService = services.value.find(
    service => 
      service.name.toLowerCase() === newService.name.toLowerCase() &&
      service.type.toLowerCase() === newService.type.toLowerCase()
  )
  
  if (existingService) {
    toast.warning(`A ${newService.type} service with name "${newService.name}" already exists`)
    isSaving.value = false
    return
  }

  try {
    const service = {
      name: newService.name,
      type: newService.type,
      price: parseFloat(newService.price),
      createdAt: new Date(),  
      description: newService.description || 'No description provided'
    }

    const docRef = await addDoc(collection(db, 'services'), service)
    
    // Add the new service to the local state with the Firebase document ID
    services.value.push({
      id: docRef.id,
      ...service
    })
    
    // Reset form
    Object.assign(newService, {
      name: '',
      type: '',
      price: '',
      description: ''
    })
    
    showForm.value = true
    toast.success('Service created successfully!')
  } catch (error) {
    console.error('Error creating service:', error)
    toast.error('Failed to create service. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const editService = (service) => {
  isEditing.value = true
  editingServiceId.value = service.id
  showForm.value = true
  Object.assign(newService, {
    name: service.name,
    type: service.type,
    price: service.price,
    description: service.description || ''
  })
}

const updateService = async () => {
  isSaving.value = true
  if (!newService.name || !newService.type || !newService.price) {
    toast.warning('Please fill in all required fields')
    isSaving.value = false
    return
  }

  // Check if another service with same name and type exists (excluding current service)
  const existingService = services.value.find(
    service => 
      service.id !== editingServiceId.value &&
      service.name.toLowerCase() === newService.name.toLowerCase() &&
      service.type.toLowerCase() === newService.type.toLowerCase()
  )
  
  if (existingService) {
    toast.warning(`A ${newService.type} service with name "${newService.name}" already exists`)
    isSaving.value = false
    return
  }

  try {
    const serviceRef = doc(db, 'services', editingServiceId.value)
    const updatedService = {
      name: newService.name,
      type: newService.type,
      price: parseFloat(newService.price),
      description: newService.description || 'No description provided',
      updatedAt: new Date()
    }

    await updateDoc(serviceRef, updatedService)
    
    // Update the service in the local state
    const index = services.value.findIndex(s => s.id === editingServiceId.value)
    if (index !== -1) {
      services.value[index] = {
        id: editingServiceId.value,
        ...updatedService
      }
    }

    // Reset form and editing state
    Object.assign(newService, {
      name: '',
      type: '',
      price: '',
      description: ''
    })
    isEditing.value = false
    editingServiceId.value = null
    showForm.value = true
    toast.success('Service updated successfully!')
  } catch (error) {
    console.error('Error updating service:', error)
    toast.error('Failed to update service. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (service) => {
  serviceToDelete.value = service
  showDeleteConfirm.value = true
}

const deleteService = async () => {
  try {
    await deleteDoc(doc(db, 'services', serviceToDelete.value.id))
    services.value = services.value.filter(service => service.id !== serviceToDelete.value.id)
    toast.success('Service deleted successfully!')
    showDeleteConfirm.value = false
    serviceToDelete.value = null
  } catch (error) {
    console.error('Error deleting service:', error)
    toast.error('Failed to delete service. Please try again.')
  }
}

// Load services when component mounts
onMounted(() => {
  fetchServices()
})
</script>

<template>
  <div class="max-w-7xl  min-h-[80vh]">
    <!-- Header -->
    <div class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-3xl font-semibold text-gray-900 m-0">Service Configuration</h1>
        <p class="text-sm text-gray-500 mt-1 mb-0">Manage and configure your offered services</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
      <!-- Create New Service Form -->
      <div class="bg-gray-50 rounded-xl overflow-hidden">
        <div 
          @click="showForm = !showForm"
          class="px-5 py-4 bg-white border-b border-gray-200 cursor-pointer flex items-center gap-2.5 font-medium text-gray-700"
        >
          <span class="text-lg text-indigo-600">{{ showForm ? '−' : '+' }}</span>
          {{ isEditing ? 'Edit Service' : 'Create New Service' }}
        </div>
        
        <div v-if="showForm" class="p-5">
          <div class="mb-5">
            <label for="serviceName" class="block mb-1.5 font-medium text-gray-700 text-sm">Service Name</label>
            <input 
              id="serviceName"
              v-model="newService.name" 
              type="text" 
              placeholder="Enter service name"
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div class="mb-5">
            <label for="serviceType" class="block mb-1.5 font-medium text-gray-700 text-sm">Service Type</label>
            <select 
              id="serviceType"
              v-model="newService.type" 
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
              <option value="">Select service type</option>
              <option value="premium">Premium</option>
              <option value="basic">Basic</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>

          <div class="mb-5">
            <label for="price" class="block mb-1.5 font-medium text-gray-700 text-sm">Price (₹)</label>
            <input 
              id="price"
              v-model="newService.price" 
              type="number" 
              placeholder="0.00"
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div class="mb-5">
            <label for="description" class="block mb-1.5 font-medium text-gray-700 text-sm">
              Description <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea 
              id="description"
              v-model="newService.description" 
              placeholder="Enter service description..."
              rows="3"
              class="w-full px-3 py-3 border border-gray-300 rounded-md text-sm resize-y min-h-20 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            ></textarea>
          </div>

          <button 
            @click="isEditing ? updateService() : createService()"
            :disabled="isSaving"
            class="w-full bg-indigo-600 text-white border-none px-3 py-3 rounded-md font-medium cursor-pointer hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isSaving" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEditing ? 'Update Service' : 'Create Service' }}
          </button>
        </div>
      </div>

      <!-- Existing Services -->
      <div class="min-h-96">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-4">
          <h2 class="text-xl font-semibold text-gray-900 m-0">Existing Services</h2>
          <div class="w-full md:w-80">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search services..."
              class="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </div>

        <!-- Loading Skeletons -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div v-for="n in 6" :key="n" class="bg-white border border-gray-200 rounded-xl p-5">
            <div class="flex justify-between items-start mb-3">
              <div class="w-full">
                <div class="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div class="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
            <div class="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
            <div class="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>

        <!-- Services Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[calc(100vh-300px)] overflow-y-scroll ">
          <div 
            v-for="service in filteredServices" 
            :key="service.id"
            class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow "
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-base font-semibold text-gray-900 m-0 mb-1.5">{{ service.name }}</h3>
                <span 
                  class="inline-block px-2 py-1 rounded text-xs font-medium capitalize"
                  :class="{
                    'bg-blue-100 text-blue-800': service.type.toLowerCase() === 'premium',
                    'bg-gray-100 text-gray-700': service.type.toLowerCase() === 'basic',
                    'bg-pink-100 text-pink-800': service.type.toLowerCase() === 'deluxe'
                  }"
                >
                  {{ service.type }}
                </span>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="editService(service)"
                  class="bg-transparent border-none p-1.5 cursor-pointer rounded hover:bg-gray-100 transition-colors"
                >
                  ✏️
                </button>
                <button 
                  @click="confirmDelete(service)"
                  class="bg-transparent border-none p-1.5 cursor-pointer rounded hover:bg-gray-100 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="text-2xl font-bold text-gray-900 mb-2">
              ₹{{ service.price.toLocaleString() }}
            </div>
            
            <div class="text-gray-600 text-sm leading-relaxed">
              {{ service.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Service</h3>
          <p class="text-gray-600">
            Are you sure you want to delete service "{{ serviceToDelete?.name }}"? This action cannot be undone.
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
            @click="deleteService"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Delete Service
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
