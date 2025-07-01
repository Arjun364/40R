<template>
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-semibold mb-4">Bookings</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="py-2 px-4 border">Invoice ID</th>
            <th class="py-2 px-4 border">Customer Name</th>
            <th class="py-2 px-4 border">Branch</th>
            <th class="py-2 px-4 border">Date</th>
            <th class="py-2 px-4 border">Time</th>
            <th class="py-2 px-4 border">Service</th>
            <th class="py-2 px-4 border">Vehicle</th>
            <th class="py-2 px-4 border">Payment Method</th>
            <th class="py-2 px-4 border">Total Price</th>
            <th class="py-2 px-4 border">Status</th>
            <th class="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.invoiceId" class="hover:bg-gray-50">
            <td class="py-2 px-4 border">{{ booking.invoiceId }}</td>
            <td class="py-2 px-4 border">{{ booking.customerName }}</td>
            <td class="py-2 px-4 border">{{ booking.branch }}</td>
            <td class="py-2 px-4 border">{{ booking.date }}</td>
            <td class="py-2 px-4 border">{{ booking.time }}</td>
            <td class="py-2 px-4 border">{{ booking.service }}</td>
            <td class="py-2 px-4 border">{{ booking.vehicle }}</td>
            <td class="py-2 px-4 border">{{ booking.paymentMethod }}</td>
            <td class="py-2 px-4 border">₹{{ booking.totalPrice }}</td>
            <td class="py-2 px-4 border">
              <span 
                :class="{
                  'px-2 py-1 rounded-full text-sm': true,
                  'bg-yellow-100 text-yellow-800': booking.status === 'confirmed',
                  'bg-green-100 text-green-800': booking.status === 'completed'
                }"
              >
                {{ booking.status }}
              </span>
            </td>
            <td class="py-2 px-4 border">
              <button 
                v-if="booking.status === 'confirmed'"
                @click="updateStatus(booking.invoiceId)"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Complete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/Config/firebase'

const bookings = ref([])

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
  })
})

const updateStatus = async (invoiceId) => {
  try {
    const bookingDoc = bookings.value.find(b => b.invoiceId === invoiceId)
    if (bookingDoc) {
      await updateDoc(doc(db, 'bookings', bookingDoc.id), {
        status: 'completed'
      })
    }
  } catch (error) {
    console.error('Error updating status:', error)
  }
}
</script>