<template>
  <div class="p-4 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 bg-base-200 p-4 rounded-lg">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <button class="btn btn-sm btn-ghost" @click="previousMonth">
            <span class="text-lg">←</span>
          </button>
          <h2 class="text-xl font-semibold">
            {{ currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }) }}
          </h2>
          <button class="btn btn-sm btn-ghost" @click="nextMonth">
            <span class="text-lg">→</span>
          </button>
        </div>
        <div class="divider divider-horizontal"></div>
        <button 
          class="btn btn-sm" 
          :class="{ 'btn-primary': isCurrentDateToday }"
          @click="goToToday"
        >
          今日
        </button>
      </div>
      <ThemeToggle />
    </div>

    <!-- TODO追加モーダル -->
    <dialog id="todo_modal" class="modal" :class="{ 'modal-open': showModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ selectedDate?.toLocaleDateString('ja-JP') }} のタスクを追加
        </h3>
        <div class="form-control w-full">
          <input v-model="newTodo"
                 type="text"
                 placeholder="新しいタスクを入力..."
                 class="input input-bordered w-full"
                 @keyup.enter="addTodo"
                 ref="todoInput" />
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeModal">キャンセル</button>
          <button class="btn btn-primary" @click="addTodo">
            追加
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal">閉じる</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useTodoStore } from '~/stores/todo'
import ThemeToggle from './ThemeToggle.vue'

// ストアとステート管理
const todoStore = useTodoStore()
const currentDate = ref(new Date())
const showModal = ref(false)
const selectedDate = ref<Date | null>(null)
const newTodo = ref('')
const todoInput = ref<HTMLInputElement | null>(null)

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const closeModal = () => {
  showModal.value = false
  newTodo.value = ''
  selectedDate.value = null
}

const addTodo = () => {
  if (newTodo.value.trim() && selectedDate.value) {
    todoStore.addTodo(newTodo.value.trim(), 'new', formatDate(selectedDate.value))
    closeModal()
  }
}

const goToToday = () => {
  const today = new Date()
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

const isCurrentDateToday = computed(() => {
  const today = new Date()
  return (
    today.getMonth() === currentDate.value.getMonth() &&
    today.getFullYear() === currentDate.value.getFullYear()
  )
})
</script>

<style scoped>
</style>