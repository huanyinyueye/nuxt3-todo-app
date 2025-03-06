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

    <!-- カレンダーグリッド -->
    <div class="card bg-base-100">
      <div class="border border-base-300">
        <div class="grid grid-cols-7">
          <!-- 曜日のヘッダー -->
          <div v-for="day in ['日', '月', '火', '水', '木', '金', '土']" 
               :key="day"
               class="text-center p-2 text-sm font-medium bg-base-200 border-b border-r border-base-300"
               :class="{ 
                 'text-error': day === '日', 
                 'text-info': day === '土'
               }">
            {{ day }}
          </div>

          <!-- Calendar cells -->
          <div v-for="(date, index) in calendarDates" 
               :key="date.toISOString()"
               class="min-h-[120px] p-3 relative group transition-colors border-r border-b border-base-300"
               :class="{ 
                 'opacity-50': !isCurrentMonth(date),
                 'hover:bg-base-200/50': !isToday(date),
                 'border-r-0': (index + 1) % 7 === 0
               }">
            <!-- 日付 -->
            <div class="flex justify-between items-start mb-2">
              <span 
                class="text-sm w-6 h-6 flex items-center justify-center rounded-full"
                :class="{ 
                  'bg-primary text-primary-content font-medium': isToday(date)
                }"
              >
                {{ date.getDate() }}
              </span>
              <button @click="openAddTodoModal(date)"
                      class="btn btn-xs btn-ghost btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <!-- その日のTODOリスト -->
            <div class="space-y-1">
              <div v-for="todo in getTodosForDate(date)" 
                   :key="todo.id"
                   class="group/item flex items-start gap-2 p-1.5 rounded hover:bg-base-200 transition-colors">
                <input type="checkbox"
                       :checked="todo.completed"
                       @change="toggleTodo(todo.id)"
                       class="checkbox checkbox-xs mt-0.5" />
                <span class="text-xs flex-grow" :class="{ 'line-through opacity-50': todo.completed }">
                  {{ todo.text }}
                </span>
                <button @click="removeTodo(todo.id)" 
                        class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover/item:opacity-100 transition-opacity -my-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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

const todoStore = useTodoStore()
const currentDate = ref(new Date())
const showModal = ref(false)
const selectedDate = ref<Date | null>(null)
const newTodo = ref('')
const todoInput = ref<HTMLInputElement | null>(null)

// カレンダーの日付を生成
const calendarDates = computed(() => {
  const dates: Date[] = []
  const firstDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const lastDay = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
  
  // 月初めの週の前月の日付を追加
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek; i > 0; i--) {
    dates.push(new Date(firstDay.getTime() - i * 24 * 60 * 60 * 1000))
  }
  
  // 当月の日付を追加
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), i))
  }
  
  // 月末の週の翌月の日付を追加
  const remainingDays = 7 - (dates.length % 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      dates.push(new Date(lastDay.getTime() + i * 24 * 60 * 60 * 1000))
    }
  }
  
  return dates
})

// 日付操作関数
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const isCurrentMonth = (date: Date) => {
  return date.getMonth() === currentDate.value.getMonth()
}

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

// TODO操作関数
const getTodosForDate = (date: Date) => {
  return todoStore.getTodosByDate(formatDate(date))
}

const openAddTodoModal = (date: Date) => {
  selectedDate.value = date
  showModal.value = true
  // Focus the input field when modal opens
  nextTick(() => {
    todoInput.value?.focus()
  })
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

const removeTodo = (id: number) => {
  todoStore.removeTodo(id)
}

const toggleTodo = (id: number) => {
  todoStore.toggleTodo(id)
}

// 今日ボタンの処理を追加
const goToToday = () => {
  const today = new Date()
  // Set to first day of current month while preserving today's highlighting
  currentDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

// Update isCurrentDateToday to check for exact date match
const isCurrentDateToday = computed(() => {
  const today = new Date()
  return (
    today.getMonth() === currentDate.value.getMonth() &&
    today.getFullYear() === currentDate.value.getFullYear()
  )
})
</script>

<style scoped>
/* Remove the previous style since we're using borders directly in the template */
</style>