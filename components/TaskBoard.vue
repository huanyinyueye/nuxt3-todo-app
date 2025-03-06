<template>
  <div>
    <!-- Search and Filter -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="タスクを検索..." 
          class="input input-bordered w-full bg-[#2A2D31] text-white"
        />
      </div>
      <select 
        v-model="filterPriority" 
        class="select select-bordered bg-[#2A2D31] text-white"
      >
        <option value="">優先度: すべて</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
      <select 
        v-model="sortBy" 
        class="select select-bordered bg-[#2A2D31] text-white"
      >
        <option value="dueDate">期限順</option>
        <option value="priority">優先度順</option>
        <option value="created">作成日順</option>
      </select>
    </div>

    <!-- Task Columns -->
    <div class="grid grid-cols-4 gap-6">
      <!-- New Task Column -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">新規タスク</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ filteredNewTasks.length }}</span>
        </div>
        <draggable 
          v-model="newTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('new', e)"
        >
          <template #item="{ element: todo }">
            <div class="bg-[#1E2124] p-4 rounded-lg group hover:bg-[#2A2D31] transition-colors border-l-4"
                 :class="{
                   'border-blue-500': !isOverdue(todo.dueDate) || todo.status === 'completed',
                   'border-red-500 bg-red-900/10': isOverdue(todo.dueDate) && todo.status !== 'completed'
                 }">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2">
                      <svg v-if="isOverdue(todo.dueDate) && todo.status !== 'completed'" class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-sm text-white break-words">{{ todo.text }}</p>
                    </div>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="editTask(todo)" class="btn btn-ghost btn-xs">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="deleteTask(todo.id)" class="btn btn-ghost btn-xs text-error">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span v-if="todo.priority" 
                            :class="{
                              'bg-red-500 text-white': todo.priority === 'high',
                              'bg-yellow-500 text-black': todo.priority === 'medium',
                              'bg-blue-500 text-white': todo.priority === 'low'
                            }"
                            class="text-xs px-2 py-0.5 rounded font-medium">
                        {{ getPriorityLabel(todo.priority) }}
                      </span>
                      <span v-if="todo.label" class="bg-[#FFF4E5] bg-opacity-20 text-xs px-2 py-0.5 rounded">
                        {{ todo.label }}
                      </span>
                    </div>
                    <span v-if="todo.dueDate" 
                          class="text-xs" 
                          :class="{
                            'text-gray-400': !isOverdue(todo.dueDate) || todo.status === 'completed',
                            'text-red-400 font-medium': isOverdue(todo.dueDate) && todo.status !== 'completed'
                          }">
                      {{ formatDueDate(todo.dueDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Scheduled Column -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">スケジュール済み</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ filteredScheduledTasks.length }}</span>
        </div>
        <draggable 
          v-model="scheduledTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('scheduled', e)"
        >
          <template #item="{ element: todo }">
            <div class="bg-[#1E2124] p-4 rounded-lg group hover:bg-[#2A2D31] transition-colors border-l-4"
                 :class="{
                   'border-yellow-500': !isOverdue(todo.dueDate) || todo.status === 'completed',
                   'border-red-500 bg-red-900/10': isOverdue(todo.dueDate) && todo.status !== 'completed'
                 }">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2">
                      <svg v-if="isOverdue(todo.dueDate) && todo.status !== 'completed'" class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-sm text-white break-words">{{ todo.text }}</p>
                    </div>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="editTask(todo)" class="btn btn-ghost btn-xs">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="deleteTask(todo.id)" class="btn btn-ghost btn-xs text-error">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span v-if="todo.priority" 
                            :class="{
                              'bg-red-500 text-white': todo.priority === 'high',
                              'bg-yellow-500 text-black': todo.priority === 'medium',
                              'bg-blue-500 text-white': todo.priority === 'low'
                            }"
                            class="text-xs px-2 py-0.5 rounded font-medium">
                        {{ getPriorityLabel(todo.priority) }}
                      </span>
                      <span v-if="todo.label" class="bg-[#FFF4E5] bg-opacity-20 text-xs px-2 py-0.5 rounded">
                        {{ todo.label }}
                      </span>
                    </div>
                    <span v-if="todo.dueDate" 
                          class="text-xs" 
                          :class="{
                            'text-gray-400': !isOverdue(todo.dueDate) || todo.status === 'completed',
                            'text-red-400 font-medium': isOverdue(todo.dueDate) && todo.status !== 'completed'
                          }">
                      {{ formatDueDate(todo.dueDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- In Progress Column -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">進行中</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ filteredInProgressTasks.length }}</span>
        </div>
        <draggable 
          v-model="inProgressTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('in_progress', e)"
        >
          <template #item="{ element: todo }">
            <div class="bg-[#1E2124] p-4 rounded-lg group hover:bg-[#2A2D31] transition-colors border-l-4"
                 :class="{
                   'border-purple-500': !isOverdue(todo.dueDate) || todo.status === 'completed',
                   'border-red-500 bg-red-900/10': isOverdue(todo.dueDate) && todo.status !== 'completed'
                 }">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2">
                      <svg v-if="isOverdue(todo.dueDate) && todo.status !== 'completed'" class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-sm text-white break-words">{{ todo.text }}</p>
                    </div>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="editTask(todo)" class="btn btn-ghost btn-xs">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="deleteTask(todo.id)" class="btn btn-ghost btn-xs text-error">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span v-if="todo.priority" 
                            :class="{
                              'bg-red-500 text-white': todo.priority === 'high',
                              'bg-yellow-500 text-black': todo.priority === 'medium',
                              'bg-blue-500 text-white': todo.priority === 'low'
                            }"
                            class="text-xs px-2 py-0.5 rounded font-medium">
                        {{ getPriorityLabel(todo.priority) }}
                      </span>
                      <span v-if="todo.label" class="bg-[#E8F1FF] bg-opacity-20 text-xs px-2 py-0.5 rounded">
                        {{ todo.label }}
                      </span>
                    </div>
                    <span v-if="todo.dueDate" 
                          class="text-xs" 
                          :class="{
                            'text-gray-400': !isOverdue(todo.dueDate) || todo.status === 'completed',
                            'text-red-400 font-medium': isOverdue(todo.dueDate) && todo.status !== 'completed'
                          }">
                      {{ formatDueDate(todo.dueDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Completed Column -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">完了</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ filteredCompletedTasks.length }}</span>
        </div>
        <draggable 
          v-model="completedTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('completed', e)"
        >
          <template #item="{ element: todo }">
            <div class="bg-[#1E2124] p-4 rounded-lg group hover:bg-[#2A2D31] transition-colors border-l-4"
                 :class="{
                   'border-green-500': !isOverdue(todo.dueDate) || todo.status === 'completed',
                   'border-red-500 bg-red-900/10': isOverdue(todo.dueDate) && todo.status !== 'completed'
                 }">
              <div class="flex items-start gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-2">
                      <svg v-if="isOverdue(todo.dueDate) && todo.status !== 'completed'" class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p class="text-sm text-white break-words">{{ todo.text }}</p>
                    </div>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button @click="editTask(todo)" class="btn btn-ghost btn-xs">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="deleteTask(todo.id)" class="btn btn-ghost btn-xs text-error">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-2 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span v-if="todo.priority" 
                            :class="{
                              'bg-red-500 text-white': todo.priority === 'high',
                              'bg-yellow-500 text-black': todo.priority === 'medium',
                              'bg-blue-500 text-white': todo.priority === 'low'
                            }"
                            class="text-xs px-2 py-0.5 rounded font-medium">
                        {{ getPriorityLabel(todo.priority) }}
                      </span>
                      <span v-if="todo.label" class="bg-[#4CAF50] bg-opacity-20 text-xs px-2 py-0.5 rounded">
                        {{ todo.label }}
                      </span>
                    </div>
                    <span v-if="todo.dueDate" 
                          class="text-xs" 
                          :class="{
                            'text-gray-400': !isOverdue(todo.dueDate) || todo.status === 'completed',
                            'text-red-400 font-medium': isOverdue(todo.dueDate) && todo.status !== 'completed'
                          }">
                      {{ formatDueDate(todo.dueDate) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <dialog :class="{ 'modal modal-open': editingTask !== null }" class="modal">
      <div class="modal-box bg-[#2A2D31]">
        <h3 class="font-bold text-lg mb-6">タスクの編集</h3>
        <form v-if="editingTask" @submit.prevent="handleEditSubmit" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-white">タスク名</span>
            </label>
            <input v-model="editingTask.text" 
                   type="text" 
                   class="input input-bordered w-full bg-[#1E2124]" 
                   required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-white">期限</span>
            </label>
            <input v-model="editingTask.dueDate" 
                   type="date" 
                   class="input input-bordered w-full bg-[#1E2124]" />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-white">優先度</span>
            </label>
            <select v-model="editingTask.priority" 
                    class="select select-bordered w-full bg-[#1E2124]">
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text text-white">ラベル</span>
            </label>
            <input v-model="editingTask.label" 
                   type="text" 
                   class="input input-bordered w-full bg-[#1E2124]" />
          </div>

          <div class="modal-action">
            <button type="button" 
                    class="btn btn-ghost" 
                    @click="closeEditModal">キャンセル</button>
            <button type="submit" 
                    class="btn bg-[#6366F1] hover:bg-[#5558E5] text-white border-none">
              更新
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeEditModal">閉じる</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useTodoStore } from '~/stores/todo'
import draggable from 'vuedraggable'

interface Todo {
  id: number
  text: string
  completed: boolean
  status: 'new' | 'scheduled' | 'in_progress' | 'completed'
  dueDate?: string
  priority?: 'high' | 'medium' | 'low'
  label?: string
  createdAt: number
}

interface DragEvent {
  added?: { element: Todo }
  moved?: { element: Todo }
}

const todoStore = useTodoStore()

// Initialize store
todoStore.init()

// Task lists
const newTasks = ref<Todo[]>([])
const scheduledTasks = ref<Todo[]>([])
const inProgressTasks = ref<Todo[]>([])
const completedTasks = ref<Todo[]>([])

// Search and filter
const searchQuery = ref('')
const filterPriority = ref<Todo['priority'] | ''>('')
const sortBy = ref<'dueDate' | 'priority' | 'created'>('dueDate')

// Task lists with filtering and sorting
const filteredNewTasks = computed<Todo[]>(() => {
  if (!todoStore?.todos?.length) return []
  return filterAndSortTasks(todoStore.getNewTasks, false)
})

const filteredScheduledTasks = computed<Todo[]>(() => {
  if (!todoStore?.todos?.length) return []
  return filterAndSortTasks(todoStore.getScheduledTasks, false)
})

const filteredInProgressTasks = computed<Todo[]>(() => {
  if (!todoStore?.todos?.length) return []
  return filterAndSortTasks(todoStore.getInProgressTasks, false)
})

const filteredCompletedTasks = computed<Todo[]>(() => {
  if (!todoStore?.todos?.length) return []
  return filterAndSortTasks(todoStore.getCompletedTasks, false)
})

// Initialize task lists with default empty arrays
newTasks.value = []
scheduledTasks.value = []
inProgressTasks.value = []
completedTasks.value = []

// Initialize task lists on mount
onMounted(() => {
  if (todoStore?.todos?.length) {
    newTasks.value = todoStore.getNewTasks
    scheduledTasks.value = todoStore.getScheduledTasks
    inProgressTasks.value = todoStore.getInProgressTasks
    completedTasks.value = todoStore.getCompletedTasks
  }
})

// Watch for changes in filtered tasks and update the refs
watch([filteredNewTasks, filteredScheduledTasks, filteredInProgressTasks, filteredCompletedTasks], 
  ([newTasksVal, scheduledTasksVal, inProgressTasksVal, completedTasksVal]) => {
    if (process.client) {
      // Only update if the length has changed (new task added/removed)
      // or if the search/filter/sort criteria have changed
      if (newTasks.value.length !== newTasksVal.length || searchQuery.value || filterPriority.value || sortBy.value !== 'created') {
        newTasks.value = newTasksVal ?? []
      }
      if (scheduledTasks.value.length !== scheduledTasksVal.length || searchQuery.value || filterPriority.value || sortBy.value !== 'created') {
        scheduledTasks.value = scheduledTasksVal ?? []
      }
      if (inProgressTasks.value.length !== inProgressTasksVal.length || searchQuery.value || filterPriority.value || sortBy.value !== 'created') {
        inProgressTasks.value = inProgressTasksVal ?? []
      }
      if (completedTasks.value.length !== completedTasksVal.length || searchQuery.value || filterPriority.value || sortBy.value !== 'created') {
        completedTasks.value = completedTasksVal ?? []
      }
    }
  },
  { immediate: true }
)

// Filter and sort function
const filterAndSortTasks = (tasks: Todo[], shouldSort: boolean = false) => {
  if (!Array.isArray(tasks) || !tasks.length) return []
  let filtered = [...tasks]

  // Search filter
  if (searchQuery.value) {
    filtered = filtered.filter(task => 
      task?.text?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task?.label?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Priority filter
  if (filterPriority.value) {
    filtered = filtered.filter(task => task?.priority === filterPriority.value)
  }

  // Only sort if explicitly requested or if user is using sort controls
  if (shouldSort || sortBy.value !== 'created') {
    filtered.sort((a, b) => {
      if (!a || !b) return 0
      switch (sortBy.value) {
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0
          return dateA - dateB
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          const priorityA = priorityOrder[a.priority || 'low'] || 2
          const priorityB = priorityOrder[b.priority || 'low'] || 2
          return priorityA - priorityB
        case 'created':
          return (a.createdAt || 0) - (b.createdAt || 0)
        default:
          return 0
      }
    })
  }

  return filtered
}

// Drag and drop handling
const handleDragChange = (newStatus: Todo['status'], event: DragEvent) => {
  if (!event.added && !event.moved) return
  
  const task = event.added?.element || event.moved?.element
  if (task && task.status !== newStatus) {
    todoStore.updateTodoStatus(task.id, newStatus)
  }
}

// Task editing
const editingTask = ref<Todo | null>(null)

const editTask = (task: Todo) => {
  editingTask.value = { 
    ...task
  }
}

const closeEditModal = () => {
  editingTask.value = null
}

const handleEditSubmit = () => {
  if (editingTask.value) {
    todoStore.updateTask(editingTask.value)
    closeEditModal()
  }
}

// Task deletion
const deleteTask = (id: number) => {
  if (confirm('このタスクを削除してもよろしいですか？')) {
    todoStore.removeTodo(id)
  }
}

// Utility functions
const getPriorityLabel = (priority: Todo['priority']) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority || 'low']
}

const formatDueDate = (date: string) => {
  if (!date) return ''
  const dueDate = new Date(date)
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}日経過`
  } else if (diffDays === 0) {
    return '今日まで'
  } else if (diffDays <= 7) {
    return `${diffDays}日後`
  } else {
    return dueDate.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  }
}

// Add the isOverdue function
const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day
  const taskDueDate = new Date(dueDate)
  taskDueDate.setHours(0, 0, 0, 0) // Reset time to start of day
  return taskDueDate < today
}
</script> 