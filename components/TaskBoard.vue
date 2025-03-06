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
      <!-- 新規タスク -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">{{ columnTitles.new }}</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ newTasks.length }}</span>
        </div>
        <draggable 
          v-model="newTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('new', e)"
        >
          <template #item="{ element: todo }">
            <TaskCard 
              :todo="todo"
              status="new"
              @edit="editTask"
              @delete="deleteTask"
            />
          </template>
        </draggable>
      </div>

      <!-- スケジュール済み -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">{{ columnTitles.scheduled }}</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ scheduledTasks.length }}</span>
        </div>
        <draggable 
          v-model="scheduledTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('scheduled', e)"
        >
          <template #item="{ element: todo }">
            <TaskCard 
              :todo="todo"
              status="scheduled"
              @edit="editTask"
              @delete="deleteTask"
            />
          </template>
        </draggable>
      </div>

      <!-- 進行中 -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">{{ columnTitles.in_progress }}</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ inProgressTasks.length }}</span>
        </div>
        <draggable 
          v-model="inProgressTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('in_progress', e)"
        >
          <template #item="{ element: todo }">
            <TaskCard 
              :todo="todo"
              status="in_progress"
              @edit="editTask"
              @delete="deleteTask"
            />
          </template>
        </draggable>
      </div>

      <!-- 完了 -->
      <div class="bg-[#2A2D31] p-4 rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium">{{ columnTitles.completed }}</h2>
          <span class="bg-[#1E2124] px-3 py-1 rounded-lg text-sm">{{ completedTasks.length }}</span>
        </div>
        <draggable 
          v-model="completedTasks" 
          :group="{ name: 'tasks' }"
          item-key="id"
          class="space-y-3 min-h-[200px]"
          @change="(e: DragEvent) => handleDragChange('completed', e)"
        >
          <template #item="{ element: todo }">
            <TaskCard 
              :todo="todo"
              status="completed"
              @edit="editTask"
              @delete="deleteTask"
            />
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
import TaskCard from './TaskCard.vue'

// タスクの型定義
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

// ドラッグ＆ドロップイベントの型定義
interface DragEvent {
  added?: { element: Todo }
  moved?: { element: Todo }
}

const todoStore = useTodoStore()

// ストアの初期化
todoStore.init()

// タスクリストの状態管理
const newTasks = ref<Todo[]>([])
const scheduledTasks = ref<Todo[]>([])
const inProgressTasks = ref<Todo[]>([])
const completedTasks = ref<Todo[]>([])

// 検索とフィルタリングの状態
const searchQuery = ref('')
const filterPriority = ref<Todo['priority'] | ''>('')
const sortBy = ref<'dueDate' | 'priority' | 'created'>('dueDate')

const columnTitles = {
  new: '新規タスク',
  scheduled: 'スケジュール済み',
  in_progress: '進行中',
  completed: '完了'
} as const

const taskColumns = computed(() => ({
  new: newTasks.value,
  scheduled: scheduledTasks.value,
  in_progress: inProgressTasks.value,
  completed: completedTasks.value
}))

// フィルタリングされたタスクリストの計算
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

// タスクリストの初期値を設定
newTasks.value = []
scheduledTasks.value = []
inProgressTasks.value = []
completedTasks.value = []

// コンポーネントマウント時の初期化
onMounted(() => {
  if (todoStore?.todos?.length) {
    newTasks.value = todoStore.getNewTasks
    scheduledTasks.value = todoStore.getScheduledTasks
    inProgressTasks.value = todoStore.getInProgressTasks
    completedTasks.value = todoStore.getCompletedTasks
  }
})

// フィルタリングされたタスクの変更を監視
watch([filteredNewTasks, filteredScheduledTasks, filteredInProgressTasks, filteredCompletedTasks], 
  ([newTasksVal, scheduledTasksVal, inProgressTasksVal, completedTasksVal]) => {
    if (process.client) {
      // タスクの数が変更された場合、または検索/フィルタ/ソートが変更された場合のみ更新
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

// タスクのフィルタリングとソート処理
const filterAndSortTasks = (tasks: Todo[], shouldSort: boolean = false) => {
  if (!Array.isArray(tasks) || !tasks.length) return []
  let filtered = [...tasks]

  // テキスト検索によるフィルタリング
  if (searchQuery.value) {
    filtered = filtered.filter(task => 
      task?.text?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task?.label?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 優先度によるフィルタリング
  if (filterPriority.value) {
    filtered = filtered.filter(task => task?.priority === filterPriority.value)
  }

  // ソート条件に基づいてタスクを並び替え
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

// ドラッグ＆ドロップの処理
const handleDragChange = (newStatus: Todo['status'], event: DragEvent) => {
  if (!event.added && !event.moved) return
  
  const task = event.added?.element || event.moved?.element
  if (task && task.status !== newStatus) {
    todoStore.updateTodoStatus(task.id, newStatus)
  }
}

// タスク編集の状態管理
const editingTask = ref<Todo | null>(null)

// タスク編集モーダルを開く
const editTask = (task: Todo) => {
  editingTask.value = { 
    ...task
  }
}

// タスク編集モーダルを閉じる
const closeEditModal = () => {
  editingTask.value = null
}

// タスク編集の保存
const handleEditSubmit = () => {
  if (editingTask.value) {
    todoStore.updateTask(editingTask.value)
    closeEditModal()
  }
}

// タスクの削除
const deleteTask = (id: number) => {
  if (confirm('このタスクを削除してもよろしいですか？')) {
    todoStore.removeTodo(id)
  }
}

// 優先度のラベル取得
const getPriorityLabel = (priority: Todo['priority']) => {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return labels[priority || 'low']
}

// 期限日の表示形式を整形
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

// タスクが期限切れかどうかを判定
const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDueDate = new Date(dueDate)
  taskDueDate.setHours(0, 0, 0, 0)
  return taskDueDate < today
}
</script> 