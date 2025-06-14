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
        @click="showCreateForm = true"
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
        <h2 class="text-xl font-semibold text-gray-900">All Branches</h2>
        <p class="text-gray-600 mt-1">Manage your branch locations and services</p>
      </div>

      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
          <div class="col-span-3">BRANCH NAME</div>
          <div class="col-span-3">ASSIGNED SERVICES</div>
          <div class="col-span-4">SLOTS SUMMARY</div>
          <div class="col-span-2">ACTIONS</div>
        </div>
      </div>

      <!-- Branch List -->
      <div class="divide-y divide-gray-200">
        <div v-for="branch in branches" :key="branch.id" class="px-6 py-4 hover:bg-gray-50">
          <div class="grid grid-cols-12 gap-4 items-center">
            <!-- Branch Name -->
            <div class="col-span-3">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ branch.name }}</h3>
                  <p class="text-sm text-gray-600">{{ branch.location }}</p>
                </div>
              </div>
            </div>

            <!-- Assigned Services -->
            <div class="col-span-3">
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="service in branch.services" 
                  :key="service"
                  :class="getServiceBadgeClass(service)"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ service }}
                </span>
              </div>
            </div>

            <!-- Slots Summary -->
            <div class="col-span-4">
              <div class="flex items-center gap-4 text-sm">
                <span class="text-gray-700">
                  <span class="font-medium">Morning:</span> {{ branch.slots.morning }} slots
                </span>
                <span class="text-gray-700">
                  <span class="font-medium">Noon:</span> {{ branch.slots.noon }} slots
                </span>
                <span class="text-gray-700">
                  <span class="font-medium">Evening:</span> {{ branch.slots.evening }} slots
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="col-span-2">
              <div class="flex items-center gap-2">
                <button class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button class="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
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
                  v-model="newBranch.selectedServices"
                  :value="service.name"
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
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Reactive data
const showCreateForm = ref(false)

// Sample branches data
const branches = ref([
  {
    id: 1,
    name: 'Downtown Branch',
    location: 'Main Location',
    services: ['Haircut', 'Beard Trim', 'Facial'],
    slots: { morning: 5, noon: 8, evening: 3 }
  },
  {
    id: 2,
    name: 'Westside Branch',
    location: 'Secondary Location',
    services: ['Haircut', 'Hair Color', 'Styling'],
    slots: { morning: 3, noon: 6, evening: 4 }
  },
  {
    id: 3,
    name: 'Eastside Branch',
    location: 'Premium Location',
    services: ['Haircut', 'Beard Trim', 'Facial', 'Massage'],
    slots: { morning: 4, noon: 10, evening: 6 }
  }
])

// Available services for selection
const availableServices = ref([
  { id: 'haircut', name: 'Haircut', type: 'Basic', badgeClass: 'bg-blue-100 text-blue-800' },
  { id: 'beard-trim', name: 'Beard Trim', type: 'Basic', badgeClass: 'bg-blue-100 text-blue-800' },
  { id: 'hair-color', name: 'Hair Color', type: 'Premium', badgeClass: 'bg-green-100 text-green-800' },
  { id: 'facial', name: 'Facial', type: 'Premium', badgeClass: 'bg-green-100 text-green-800' },
  { id: 'styling', name: 'Styling', type: 'Premium', badgeClass: 'bg-green-100 text-green-800' },
  { id: 'massage', name: 'Massage', type: 'Deluxe', badgeClass: 'bg-purple-100 text-purple-800' },
  { id: 'manicure', name: 'Manicure', type: 'Premium', badgeClass: 'bg-green-100 text-green-800' },
  { id: 'pedicure', name: 'Pedicure', type: 'Premium', badgeClass: 'bg-green-100 text-green-800' }
])

// New branch form data
const newBranch = reactive({
  name: '',
  location: '',
  selectedServices: [],
  slots: {
    morning: 0,
    noon: 0,
    evening: 0
  }
})

// Methods
const getServiceBadgeClass = (service) => {
  const serviceMap = {
    'Haircut': 'bg-blue-100 text-blue-800',
    'Beard Trim': 'bg-blue-100 text-blue-800',
    'Hair Color': 'bg-green-100 text-green-800',
    'Facial': 'bg-green-100 text-green-800',
    'Styling': 'bg-green-100 text-green-800',
    'Massage': 'bg-purple-100 text-purple-800'
  }
  return serviceMap[service] || 'bg-gray-100 text-gray-800'
}

const closeCreateForm = () => {
  showCreateForm.value = false
  // Reset form
  newBranch.name = ''
  newBranch.location = ''
  newBranch.selectedServices = []
  newBranch.slots = { morning: 0, noon: 0, evening: 0 }
}

const createBranch = () => {
  if (newBranch.name && newBranch.location && newBranch.selectedServices.length > 0) {
    const branch = {
      id: branches.value.length + 1,
      name: newBranch.name,
      location: newBranch.location,
      services: [...newBranch.selectedServices],
      slots: { ...newBranch.slots }
    }
    
    branches.value.push(branch)
    closeCreateForm()
    
    // You can add success notification here
    console.log('Branch created successfully:', branch)
  }
}
</script>