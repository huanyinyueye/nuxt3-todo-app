import { defineStore } from 'pinia'

// TODOアイテムのインターフェース
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

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
    initialized: false
  }),
  actions: {
    // Save to localStorage
    saveToStorage() {
      if (process.client) {
        localStorage.setItem('todos', JSON.stringify(this.todos))
      }
    },

    // Initialize store
    init() {
      if (this.initialized) return
      this.initialized = true
      
      // Initialize with empty array during SSR
      if (process.server) {
        this.todos = []
        return
      }
      
      // Load from localStorage on client side
      if (process.client) {
        const stored = localStorage.getItem('todos')
        this.todos = stored ? JSON.parse(stored) : []
      }
    },
    
    // タスク追加
    addTodo(
      text: string, 
      status: Todo['status'] = 'new', 
      dueDate?: string, 
      label?: string,
      priority?: Todo['priority']
    ) {
      this.todos.push({
        id: Date.now(),
        text,
        completed: status === 'completed',
        status,
        dueDate,
        label,
        priority,
        createdAt: Date.now()
      })
      this.saveToStorage()
    },
    
    // タスク削除
    removeTodo(id: number) {
      this.todos = this.todos.filter(todo => todo.id !== id)
      this.saveToStorage()
    },
    
    // タスク完了状態のトグル
    toggleTodo(id: number) {
      const todo = this.todos.find(todo => todo.id === id)
      if (todo) {
        todo.completed = !todo.completed
        todo.status = todo.completed ? 'completed' : 'new'
        this.saveToStorage()
      }
    },

    updateTodoStatus(id: number, status: Todo['status']) {
      const todo = this.todos.find(todo => todo.id === id)
      if (todo) {
        todo.status = status
        todo.completed = status === 'completed'
        this.saveToStorage()
      }
    },

    updateTask(updatedTodo: Todo) {
      const index = this.todos.findIndex(todo => todo.id === updatedTodo.id)
      if (index !== -1) {
        this.todos[index] = {
          ...updatedTodo,
          completed: updatedTodo.status === 'completed'
        }
        this.saveToStorage()
      }
    }
  },
  getters: {
    getNewTasks(state): Todo[] {
      return state?.todos?.filter(todo => todo.status === 'new') ?? []
    },
    getScheduledTasks(state): Todo[] {
      return state?.todos?.filter(todo => todo.status === 'scheduled') ?? []
    },
    getInProgressTasks(state): Todo[] {
      return state?.todos?.filter(todo => todo.status === 'in_progress') ?? []
    },
    getCompletedTasks(state): Todo[] {
      return state?.todos?.filter(todo => todo.status === 'completed') ?? []
    }
  }
})