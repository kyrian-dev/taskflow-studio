<script setup>
defineProps({
  projects: {
    type: Array,
    required: true,
  },
})

const selectedProjectId = defineModel('selectedProjectId')
const projectName = defineModel('projectName')
const darkMode = defineModel('darkMode')

const emit = defineEmits(['add-project'])
</script>

<template>
  <aside class="sidebar">
    <a class="brand" href="#">
      Taskflow <span>Studio</span>
    </a>

    <button
      class="theme-button"
      type="button"
      :aria-pressed="darkMode"
      @click="darkMode = !darkMode"
    >
      {{ darkMode ? '☀ Light mode' : '☾ Dark mode' }}
    </button>

    <h2 class="sidebar-heading">Projects</h2>

    <form class="project-form" @submit.prevent="emit('add-project')">
      <input
        v-model="projectName"
        aria-label="New project name"
        placeholder="New project name"
        maxlength="80"
        required
      />

      <button class="primary" type="submit">
        Create project
      </button>
    </form>

    <nav aria-label="Projects">
      <button
        v-for="project in projects"
        :key="project.id"
        class="project-link"
        :class="{ active: selectedProjectId === project.id }"
        :aria-current="
          selectedProjectId === project.id ? 'page' : undefined
        "
        @click="selectedProjectId = project.id"
      >
        <span>{{ project.name }}</span>
        <small>{{ project.tasks.length }}</small>
      </button>
    </nav>

    <p class="storage-note">
      Saved in this browser. Clearing browser data removes your projects.
    </p>
  </aside>
</template>