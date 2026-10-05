<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
  dragging: Boolean,
  first: Boolean,
  last: Boolean,
  overdue: Boolean,
  dateLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'edit',
  'delete',
  'status-change',
  'reorder',
  'drag-start',
  'drag-end',
  'drop-task',
])
</script>

<template>
  <article
    class="task-card"
    :class="{
      dragging,
      completed: task.status === 'done',
    }"
    draggable="true"
    @dragstart="emit('drag-start', $event, task)"
    @dragend="emit('drag-end')"
    @dragover.prevent
    @drop.stop.prevent="emit('drop-task', task.status, task.id)"
  >
    <div class="card-top">
      <span class="priority" :class="task.priority">
        {{ task.priority }}
      </span>

      <span class="grip" aria-hidden="true">⠿</span>
    </div>

    <h3>{{ task.title }}</h3>

    <p
      v-if="task.dueDate"
      class="due-date"
      :class="{ overdue }"
    >
      {{ dateLabel }}
      {{ overdue ? ' · Overdue' : '' }}
    </p>

    <select
      :value="task.status"
      :aria-label="`Status of ${task.title}`"
      @change="emit('status-change', task.id, $event.target.value)"
    >
      <option
        v-for="column in columns"
        :key="column.id"
        :value="column.id"
      >
        {{ column.name }}
      </option>
    </select>

    <div class="card-actions">
      <button @click="emit('edit', task)">
        Edit
      </button>

      <button
        class="danger-button"
        @click="emit('delete', task)"
      >
        Delete
      </button>

      <div class="reorder-buttons">
        <button
          :disabled="first"
          :aria-label="`Move ${task.title} up`"
          @click="emit('reorder', task, -1)"
        >
          ↑
        </button>

        <button
          :disabled="last"
          :aria-label="`Move ${task.title} down`"
          @click="emit('reorder', task, 1)"
        >
          ↓
        </button>
      </div>
    </div>
  </article>
</template>