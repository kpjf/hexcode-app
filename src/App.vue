<template>
  <RouterView />
  <AuthDialog />
</template>

<script setup>
import { useVersionCheck } from './composables/useVersionCheck.js'
import AuthDialog from './components/AuthDialog.vue'

useVersionCheck()
</script>
