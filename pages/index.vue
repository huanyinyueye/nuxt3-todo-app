<template>
  <div class="min-h-screen bg-[#1E2124] text-white">
    <div class="container mx-auto py-8 px-4">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-medium">タスク管理</h1>
        <button @click="showTaskForm = true" 
                class="bg-[#6366F1] hover:bg-[#5558E5] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span class="text-xl">+</span>
          新規タスク
        </button>
      </div>
      <TaskBoard />
      <TaskForm :is-open="showTaskForm" @close="showTaskForm = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showTaskForm = ref(false)
</script>