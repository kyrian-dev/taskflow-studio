<script setup>
import ProjectSidebar from './components/ProjectSidebar.vue'
import TaskForm from './components/TaskForm.vue'
import TaskBoard from './components/TaskBoard.vue'
import { useProjects } from './composables/useProjects'
import './assets/main.css'

const {
  columns,
  projects,
  selectedProjectId,
  darkMode,
  storageError,
  currentProject,
  completedCount,
  projectName,
  taskTitle,
  taskPriority,
  taskDueDate,
  editingTaskId,
  titleInput,
  draggedTaskId,
  activeDropColumn,
  addProject,
  deleteProject,
  saveTask,
  resetTaskForm,
  editTask,
  deleteTask,
  startDrag,
  finishDrag,
  dropTask,
  reorderTask,
  isOverdue,
  formatDate,
} = useProjects()

function changeTaskStatus(id, status) {
  const task = currentProject.value?.tasks.find(
    (item) => item.id === id,
  )

  if (task && columns.some((column) => column.id === status)) {
    task.status = status
  }
}
</script>

<template>
  <div class="workspace" :class="{ dark: darkMode }">
    <ProjectSidebar
      v-model:selected-project-id="selectedProjectId"
      v-model:project-name="projectName"
      v-model:dark-mode="darkMode"
      :projects="projects"
      @add-project="addProject"
    />

    <main>
      <p v-if="storageError" class="error" role="alert">
        {{ storageError }}
      </p>

      <template v-if="currentProject">
        <header class="project-header">
          <div>
            <p class="eyebrow">YOUR WORKSPACE</p>
            <h1>{{ currentProject.name }}</h1>

            <p class="muted">
              {{ completedCount }} of
              {{ currentProject.tasks.length }} tasks completed
            </p>
          </div>

          <button class="danger-button" @click="deleteProject">
            Delete project
          </button>
        </header>

        <TaskForm
          ref="titleInput"
          v-model:title="taskTitle"
          v-model:priority="taskPriority"
          v-model:due-date="taskDueDate"
          :editing-task-id="editingTaskId"
          @save="saveTask"
          @cancel="resetTaskForm"
        />

        <p class="board-help">
          Drag cards between columns or onto another card to reorder.
          On mobile, use the status menu and arrow buttons.
        </p>

        <TaskBoard
          :columns="columns"
          :tasks="currentProject.tasks"
          :dragged-task-id="draggedTaskId"
          :active-drop-column="activeDropColumn"
          :is-overdue="isOverdue"
          :format-date="formatDate"
          @edit="editTask"
          @delete="deleteTask"
          @status-change="changeTaskStatus"
          @reorder="reorderTask"
          @drag-start="startDrag"
          @drag-end="finishDrag"
          @drag-over="activeDropColumn = $event"
          @drop-task="dropTask"
        />
      </template>

      <section v-else class="welcome">
        <p class="eyebrow">A FRESH START</p>
        <h1>Welcome to Taskflow Studio</h1>
        <p>Create your first project in the sidebar to get started.</p>
      </section>
    </main>
  </div>
</template>