<template>
  <dialog :class="{ 'modal modal-open': isOpen }" class="modal">
    <div class="modal-box bg-[#2A2D31]">
      <h3 class="font-bold text-lg mb-6">新規タスクの作成</h3>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text text-white">タスク名</span>
          </label>
          <input v-model="taskData.text" 
                 type="text" 
                 class="input input-bordered w-full bg-[#1E2124]" 
                 required />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text text-white">期限</span>
          </label>
          <input v-model="taskData.dueDate" 
                 type="date" 
                 class="input input-bordered w-full bg-[#1E2124]" />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text text-white">優先度</span>
          </label>
          <select v-model="taskData.priority" 
                  class="select select-bordered w-full bg-[#1E2124]">
            <option value="">選択してください</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text text-white">ラベル</span>
          </label>
          <input v-model="taskData.label" 
                 type="text" 
                 class="input input-bordered w-full bg-[#1E2124]" />
        </div>

        <div class="modal-action">
          <button type="button" 
                  class="btn btn-ghost" 
                  @click="closeModal">キャンセル</button>
          <button type="submit" 
                  class="btn bg-[#6366F1] hover:bg-[#5558E5] text-white border-none">
            作成
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="closeModal">閉じる</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTodoStore } from '~/stores/todo'

type Priority = 'high' | 'medium' | 'low' | ''

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  'close': []
}>()

const todoStore = useTodoStore()

const taskData = reactive({
  text: '',
  dueDate: '',
  priority: '' as Priority,
  label: ''
})

const handleSubmit = () => {
  todoStore.addTodo(
    taskData.text,
    'new',
    taskData.dueDate,
    taskData.label,
    taskData.priority || undefined
  )
  resetForm()
  emit('close')
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  taskData.text = ''
  taskData.dueDate = ''
  taskData.priority = ''
  taskData.label = ''
}
</script> 