<template>
  <div class="p-4 max-w-7xl mx-auto">
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
</script>

<style scoped>
</style>