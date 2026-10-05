
import { computed, ref, watch } from 'vue'

export function useProjects() {
  const STORAGE_KEY = 'taskflow-studio'

  const columns = [
    { id: 'todo', name: 'To do' },
    { id: 'progress', name: 'In progress' },
    { id: 'done', name: 'Done' },
  ]

const projects = ref([])
const selectedProjectId = ref('')
const darkMode = ref(false)
const storageError = ref('')
let canSave = true

// Restore saved data before setting up automatic saving.
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')

  if (saved) {
    const valid =
      Array.isArray(saved.projects) &&
      saved.projects.every(
        (project) =>
          typeof project.id === 'string' &&
          typeof project.name === 'string' &&
          Array.isArray(project.tasks) &&
          project.tasks.every(
            (task) =>
              typeof task.id === 'string' &&
              typeof task.title === 'string' &&
              ['todo', 'progress', 'done'].includes(task.status) &&
              ['low', 'medium', 'high'].includes(task.priority) &&
              typeof task.dueDate === 'string',
          ),
      )

    if (!valid) throw new Error('Invalid saved data')

    projects.value = saved.projects
    selectedProjectId.value = saved.selectedProjectId || ''
    darkMode.value = saved.darkMode === true
  }
} catch {
  canSave = false
  storageError.value =
    'Saved data could not be loaded. Existing storage will not be overwritten.'
}

if (!projects.value.some((project) => project.id === selectedProjectId.value)) {
  selectedProjectId.value = projects.value[0]?.id || ''
}

watch(
  [projects, selectedProjectId, darkMode],
  () => {
    if (!canSave) return

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          projects: projects.value,
          selectedProjectId: selectedProjectId.value,
          darkMode: darkMode.value,
        }),
      )
      storageError.value = ''
    } catch {
      storageError.value =
        'Changes are not saved. Browser storage may be full or unavailable.'
    }
  },
  { deep: true },
)

const currentProject = computed(() =>
  projects.value.find((project) => project.id === selectedProjectId.value),
)

const completedCount = computed(
  () => currentProject.value?.tasks.filter((task) => task.status === 'done').length || 0,
)

const projectName = ref('')

function addProject() {
  const name = projectName.value.trim()
  if (!name) return

  const project = {
    id: crypto.randomUUID(),
    name,
    tasks: [],
  }

  projects.value.push(project)
  selectedProjectId.value = project.id
  projectName.value = ''
}

function deleteProject() {
  const project = currentProject.value
  if (!project) return

  if (!window.confirm(`Delete "${project.name}" and all its tasks?`)) return

  projects.value = projects.value.filter((item) => item.id !== project.id)
  selectedProjectId.value = projects.value[0]?.id || ''
}

const taskTitle = ref('')
const taskPriority = ref('medium')
const taskDueDate = ref('')
const editingTaskId = ref('')

function resetTaskForm() {
  taskTitle.value = ''
  taskPriority.value = 'medium'
  taskDueDate.value = ''
  editingTaskId.value = ''
}

watch(selectedProjectId, resetTaskForm)

function saveTask() {
  const title = taskTitle.value.trim()
  const project = currentProject.value
  if (!title || !project) return

  if (editingTaskId.value) {
    const task = project.tasks.find((item) => item.id === editingTaskId.value)
    if (!task) return

    task.title = title
    task.priority = taskPriority.value
    task.dueDate = taskDueDate.value
  } else {
    project.tasks.push({
      id: crypto.randomUUID(),
      title,
      priority: taskPriority.value,
      dueDate: taskDueDate.value,
      status: 'todo',
    })
  }

  resetTaskForm()
}

const titleInput = ref(null)

function editTask(task) {
  editingTaskId.value = task.id
  taskTitle.value = task.title
  taskPriority.value = task.priority
  taskDueDate.value = task.dueDate
  titleInput.value?.focus()
}

function deleteTask(task) {
  if (!window.confirm(`Delete "${task.title}"?`)) return

  currentProject.value.tasks = currentProject.value.tasks.filter(
    (item) => item.id !== task.id,
  )

  if (editingTaskId.value === task.id) resetTaskForm()
}

function tasksFor(status) {
  return currentProject.value?.tasks.filter((task) => task.status === status) || []
}

// Drop onto a card to insert before it, or onto a column to append.
const draggedTaskId = ref(null)
const activeDropColumn = ref(null)

function startDrag(event, task) {
  draggedTaskId.value = task.id
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', task.id)
}

function finishDrag() {
  draggedTaskId.value = null
  activeDropColumn.value = null
}

function dropTask(status, beforeId = null) {
  const project = currentProject.value
  const task = project?.tasks.find((item) => item.id === draggedTaskId.value)

  if (!task || task.id === beforeId) {
    finishDrag()
    return
  }

  const remaining = project.tasks.filter((item) => item.id !== task.id)
  task.status = status

  const index = beforeId
    ? remaining.findIndex((item) => item.id === beforeId)
    : remaining.length

  remaining.splice(index < 0 ? remaining.length : index, 0, task)
  project.tasks = remaining
  finishDrag()
}

// Reordering buttons also work with a keyboard or touchscreen.
function reorderTask(task, direction) {
  const peers = tasksFor(task.status)
  const index = peers.findIndex((item) => item.id === task.id)
  const neighbour = peers[index + direction]
  if (!neighbour) return

  const tasks = [...currentProject.value.tasks]
  const first = tasks.findIndex((item) => item.id === task.id)
  const second = tasks.findIndex((item) => item.id === neighbour.id)

  ;[tasks[first], tasks[second]] = [tasks[second], tasks[first]]
  currentProject.value.tasks = tasks
}

function isOverdue(task) {
  if (!task.dueDate || task.status === 'done') return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return new Date(`${task.dueDate}T00:00:00`) < today
}

function formatDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
  return {
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
    tasksFor,
    startDrag,
    finishDrag,
    dropTask,
    reorderTask,
    isOverdue,
    formatDate,
  }
}
