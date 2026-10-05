<script setup>
import { ref } from 'vue'

defineProps({
  editingTaskId: {
    type: String,
    default: '',
  },
})

const title = defineModel('title')
const priority = defineModel('priority')
const dueDate = defineModel('dueDate')

const emit = defineEmits(['save', 'cancel'])
const input = ref(null)

// Allows App.vue to focus this input when editing a task.
defineExpose({
  focus() {
    input.value?.focus()
  },
})
</script>

<template>
  <form class="task-form" @submit.prevent="emit('save')">
    <label class="title-field">
      {{ editingTaskId ? 'Edit task' : 'New task' }}

      <input
        ref="input"
        v-model="title"
        placeholder="What needs to get done?"
        maxlength="160"
        required
      />
    </label>

    <label>
      Priority

      <select v-model="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>

    <label>
      Due date
      <input v-model="dueDate" type="date" />
    </label>

    <button class="primary" type="submit">
      {{ editingTaskId ? 'Save changes' : '+ Add task' }}
    </button>

    <button
      v-if="editingTaskId"
      type="button"
      @click="emit('cancel')"
    >
      Cancel
    </button>
  </form>
</template>