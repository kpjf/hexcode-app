<template>
  <RouterView />
</template>

<script setup>
import { useVersionCheck } from './composables/useVersionCheck.js'

useVersionCheck()
</script>
