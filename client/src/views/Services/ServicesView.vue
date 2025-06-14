<script setup>
import { ref, computed, reactive } from 'vue'

// Reactive state
const showCreateForm = ref(true)
const searchQuery = ref('')

const newService = reactive({
  name: '',
  type: '',
  price: '',
  description: ''
})

const services = ref([
  {
    id: 1,
    name: 'Website Development',
    type: 'Premium',
    price: 25000,
    description: 'Complete website development with responsive design and modern features.'
  },
  {
    id: 2,
    name: 'Mobile App Design',
    type: 'Deluxe',
    price: 40000,
    description: 'Premium mobile app design with UI/UX optimization and prototyping.'
  },
  {
    id: 3,
    name: 'SEO Optimization',
    type: 'Basic',
    price: 8000,
    description: 'Basic SEO optimization for better search engine rankings.'
  },
  {
    id: 4,
    name: 'Logo Design',
    type: 'Premium',
    price: 12000,
    description: 'Professional logo design with multiple concepts and revisions.'
  }
])

// Computed properties
const filteredServices = computed(() => {
  if (!searchQuery.value) return services.value
  
  return services.value.filter(service =>
    service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const createService = () => {
  if (!newService.name || !newService.type || !newService.price) {
    alert('Please fill in all required fields')
    return
  }

  const service = {
    id: Date.now(),
    name: newService.name,
    type: newService.type,
    price: parseFloat(newService.price),
    description: newService.description || 'No description provided'
  }

  services.value.push(service)
  
  // Reset form
  Object.assign(newService, {
    name: '',
    type: '',
    price: '',
    description: ''
  })
  
  showCreateForm.value = false
}

const editService = (service) => {
  // Implementation for edit functionality
  console.log('Edit service:', service)
}

const deleteService = (serviceId) => {
  if (confirm('Are you sure you want to delete this service?')) {
    services.value = services.value.filter(service => service.id !== serviceId)
  }
}
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
          @click="showCreateForm = !showCreateForm"
          class="px-5 py-4 bg-white border-b border-gray-200 cursor-pointer flex items-center gap-2.5 font-medium text-gray-700"
        >
          <span class="text-lg text-indigo-600">{{ showCreateForm ? '−' : '+' }}</span>
          Create New Service
        </div>
        
        <div v-if="showCreateForm" class="p-5">
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
            @click="createService" 
            class="w-full bg-indigo-600 text-white border-none px-3 py-3 rounded-md font-medium cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            Create Service
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

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div 
            v-for="service in filteredServices" 
            :key="service.id"
            class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
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
                  @click="deleteService(service.id)"
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
  </div>
</template>
