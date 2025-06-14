<template>
  <div class="services">
    <h1>Services</h1>
    <div class="services-content">
      <p>Our available services</p>
      <div class="service-list">
        <!-- Example service items -->
        <div class="service-item">
          <h3>Service 1</h3>
          <p>Description of service 1</p>
        </div>
        <div class="service-item">
          <h3>Service 2</h3>
          <p>Description of service 2</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.services {
  padding: 20px;
}

.services-content {
  margin-top: 20px;
}

.service-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.service-item {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

.service-item h3 {
  margin: 0 0 10px 0;
}

.service-item p {
  margin: 0;
  color: #666;
}
</style>