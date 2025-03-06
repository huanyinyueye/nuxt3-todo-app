// タスクカードコンポーネント
<template>
  <div class="bg-[#1E2124] p-4 rounded-lg group hover:bg-[#2A2D31] transition-colors border-l-4"
       :class="{
         'border-blue-500': status === 'new' && (!isOverdue(todo.dueDate) || todo.status === 'completed'),
         'border-yellow-500': status === 'scheduled' && (!isOverdue(todo.dueDate) || todo.status === 'completed'),
         'border-purple-500': status === 'in_progress' && (!isOverdue(todo.dueDate) || todo.status === 'completed'),
         'border-green-500': status === 'completed' && (!isOverdue(todo.dueDate) || todo.status === 'completed'),
         'border-red-500 bg-red-900/10': isOverdue(todo.dueDate) && todo.status !== 'completed'
       }">
    <div class="flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <svg v-if="isOverdue(todo.dueDate) && todo.status !== 'completed'" 
                 class="w-4 h-4 text-red-500" 
                 fill="none" 
                 stroke="currentColor" 
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-white break-words">{{ todo.text }}</p>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="$emit('edit', todo)" class="btn btn-ghost btn-xs">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="$emit('delete', todo.id)" class="btn btn-ghost btn-xs text-error">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
            <span v-if="todo.label" 
                  :class="{
                    'bg-[#FFF4E5] bg-opacity-20': status === 'new' || status === 'scheduled',
                    'bg-[#E8F1FF] bg-opacity-20': status === 'in_progress',
                    'bg-[#4CAF50] bg-opacity-20': status === 'completed'
                  }"
                  class="text-xs px-2 py-0.5 rounded">
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

<script setup lang="ts">
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

const props = defineProps<{
  todo: Todo
  status: Todo['status']
}>()

const emit = defineEmits<{
  (e: 'edit', todo: Todo): void
  (e: 'delete', id: number): void
}>()

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
    return dueDate.toISOString().split('T')[0]
  }
}

const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDueDate = new Date(dueDate)
  taskDueDate.setHours(0, 0, 0, 0)
  return taskDueDate < today
}
</script> 