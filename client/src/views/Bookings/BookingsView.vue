<template>
  <div class="container w-[80vw] py-4">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h2 class="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Bookings</h2>
      <div class="relative">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search bookings..."
          class="w-full md:w-64 px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
        />
        <svg class="w-5 h-5 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 5" :key="n" class="animate-pulse">
        <div class="h-16 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- Table Container with horizontal scroll -->
    <div v-else>
      <!-- No results message -->
      <div v-if="filteredBookings.length === 0" class="text-center py-8">
        <p class="text-gray-500 text-lg">No bookings found matching your search.</p>
      </div>

      <!-- Table -->
      <div v-else>
      <!-- No results message -->
      <div v-if="filteredBookings.length === 0" class="text-center py-8">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-500 text-lg">No bookings found matching your search.</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto rounded-lg shadow-lg">
      <table class="w-full min-w-[1000px] bg-white border-collapse">
        <thead>
          <tr class="bg-gray-800 text-white">
            <th class="py-3 px-4 font-semibold text-sm uppercase">Invoice ID</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Customer Name</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Branch</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Date</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Time</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Service</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Vehicle</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Payment Method</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Total Price</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Status</th>
            <th class="py-3 px-4 font-semibold text-sm uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(booking, index) in paginatedBookings"
            :key="booking.invoiceId"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
            :class="{'animate-slideIn': true}"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <td class="py-3 px-4 text-sm">{{ booking.invoiceId }}</td>
            <td class="py-3 px-4 text-sm font-medium">{{ booking.customerName }}</td>
            <td class="py-3 px-4 text-sm">{{ booking.branch }}</td>
            <td class="py-3 px-4 text-sm">{{ booking.date }}</td>
            <td class="py-3 px-4 text-sm">{{ booking.time }}</td>
            <td class="py-3 px-4 text-sm">{{ booking.service }}</td>
            <td class="py-3 px-4 text-sm">{{ booking.vehicle }}</td>
            <td class="py-3 px-4 text-sm">
              <span
                :class="{
                  'px-3 py-2 rounded-lg inline-flex items-center space-x-2 transition-all duration-200': true,
                  'bg-indigo-100 text-indigo-700 border border-indigo-200': booking.paymentMethod === 'UPI',
                  'bg-purple-100 text-purple-700 border border-purple-200': booking.paymentMethod === 'Cash on Delivery'
                }"
              >
                <svg v-if="booking.paymentMethod === 'UPI'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>{{ booking.paymentMethod }}</span>
              </span>
            </td>
            <td class="py-3 px-4 text-sm font-semibold">₹{{ booking.totalPrice }}</td>
            <td class="py-3 px-4">
              <span
                :class="{
                  'px-3 py-2 rounded-lg inline-flex items-center space-x-2 transition-all duration-200': true,
                  'bg-yellow-100 text-yellow-700 border border-yellow-200': booking.status === 'confirmed',
                  'bg-green-100 text-green-700 border border-green-200': booking.status === 'completed',
                  'bg-red-100 text-red-700 border border-red-200': booking.status === 'cancelled'
                }"
              >
                <svg v-if="booking.status === 'confirmed'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-if="booking.status === 'completed'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-if="booking.status === 'cancelled'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ booking.status.charAt(0).toUpperCase() + booking.status.slice(1) }}</span>
              </span>
            </td>
            <td class="py-3 px-4">
              <div v-if="booking.status === 'confirmed'" class="flex space-x-3">
                <button
                  @click="updateStatus(booking.invoiceId, 'completed')"
                  class="w-9 h-9 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center relative group"
                  title="Complete Booking"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">Complete</span>
                </button>
                <button
                  @click="updateStatus(booking.invoiceId, 'cancelled')"
                  class="w-9 h-9 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center relative group"
                  title="Cancel Booking"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  <span class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">Cancel</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
        <div class="flex items-center">
          <p class="text-sm text-gray-700">
            {{ searchQuery ? 'Found' : 'Showing' }}
            <span class="font-medium">{{ filteredBookings.length }}</span>
            {{ searchQuery ? 'matching results' : 'total bookings' }}
            <span v-if="searchQuery" class="ml-2 text-gray-500">
              (Page {{ currentPage }} of {{ totalPages }})
            </span>
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium',
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            ]"
          >
            Previous
          </button>
          <div class="flex items-center">
            <template v-for="item in paginationItems" :key="item">
              <span v-if="item === '...'" class="px-2 text-gray-500">...</span>
              <button
                v-else
                @click="currentPage = item"
                :class="[
                  'px-3 py-1 rounded-md text-sm font-medium mx-0.5',
                  currentPage === item
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
              >
                {{ item }}
              </button>
            </template>
          </div>
          </div>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium',
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            ]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out forwards;
}
</style>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/Config/firebase'

const bookings = ref([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = 4
const searchQuery = ref('')

// Reset page when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Computed property for pagination display
const paginationItems = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

// Computed properties for pagination and filtering
const filteredBookings = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return bookings.value
    .sort((a, b) => {
      // Sort by timestamp in descending order (newest first)
      const timestampA = new Date(a.timestamp).getTime()
      const timestampB = new Date(b.timestamp).getTime()
      return timestampB - timestampA
    })
    .filter(booking => {
      if (!query) return true
      const searchableFields = [
        booking.invoiceId,
        booking.customerName,
        booking.branch,
        booking.service,
        booking.paymentMethod,
        booking.status,
        booking.vehicle,
        booking.date,
        booking.time
      ]
      return searchableFields.some(field =>
        String(field).toLowerCase().includes(query)
      )
    })
})

// Watch for search query changes to highlight matches
watch(searchQuery, (newQuery) => {
  currentPage.value = 1 // Reset to first page on new search
})

const totalPages = computed(() => Math.ceil(filteredBookings.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedBookings = computed(() => {
  return filteredBookings.value.slice(startIndex.value, endIndex.value)
})

onMounted(() => {
  const q = query(collection(db, 'bookings'))
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const bookingsData = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      bookingsData.push({
        id: doc.id,
        ...data
      })
    })
    bookings.value = bookingsData
    loading.value = false
  })
})

const updateStatus = async (invoiceId, newStatus) => {
  try {
    const bookingDoc = bookings.value.find(b => b.invoiceId === invoiceId)
    if (bookingDoc) {
      await updateDoc(doc(db, 'bookings', bookingDoc.id), {
        status: newStatus
      })
    }
  } catch (error) {
    console.error('Error updating status:', error)
  }
}
</script>