<script setup>
import TaskCard from './TaskCard.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  tasks: {
    type: Array,
    required: true,
  },
  draggedTaskId: {
    type: String,
    default: null,
  },
  activeDropColumn: {
    type: String,
    default: null,
  },
  isOverdue: {
    type: Function,
    required: true,
  },
  formatDate: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'edit',
  'delete',
  'status-change',
  'reorder',
  'drag-start',
  'drag-end',
  'drag-over',
  'drop-task',
])

function tasksFor(status) {
  return props.tasks.filter((task) => task.status === status)
}
</script>

<template>
  <section class="board" aria-label="Task board">
    <section
      v-for="column in columns"
      :key="column.id"
      class="column"
      :class="{ 'drop-active': activeDropColumn === column.id }"
      :aria-label="column.name"
      @dragover.prevent="emit('drag-over', column.id)"
      @drop.prevent="emit('drop-task', column.id)"
    >
      <h2>
        {{ column.name }}
        <span>{{ tasksFor(column.id).length }}</span>
      </h2>

      <TaskCard
        v-for="(task, index) in tasksFor(column.id)"
        :key="task.id"
        :task="task"
        :columns="columns"
        :dragging="draggedTaskId === task.id"
        :first="index === 0"
        :last="index === tasksFor(column.id).length - 1"
        :overdue="isOverdue(task)"
        :date-label="task.dueDate ? formatDate(task.dueDate) : ''"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @status-change="
          (id, status) => emit('status-change', id, status)
        "
        @reorder="
          (task, direction) => emit('reorder', task, direction)
        "
        @drag-start="
          (event, task) => emit('drag-start', event, task)
        "
        @drag-end="emit('drag-end')"
        @drop-task="
          (status, beforeId) => emit('drop-task', status, beforeId)
        "
      />

      <p
        v-if="tasksFor(column.id).length === 0"
        class="empty-column"
      >
        No tasks here yet.
      </p>
    </section>
  </section>
</template>