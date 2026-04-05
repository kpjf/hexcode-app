import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBattleStore = defineStore('battle', () => {
  const roomCode = ref(null)
  const playerName = ref(null)
  const mySocketId = ref(null)
  const ownerSocketId = ref(null)
  const phase = ref('idle') // idle | lobby | countdown | playing | finished
  const countdown = ref(null)
  const round = ref(1)
  const players = ref([]) // [{ socketId, name, status, durationSeconds }]
  const leaderboard = ref([]) // [{ rank, name, durationSeconds, dnf }]
  const battleSeed = ref(null)
  const notifications = ref([]) // [{ id, message }]
  const error = ref(null)

  const isOwner = computed(() => !!mySocketId.value && mySocketId.value === ownerSocketId.value)
  const canStart = computed(() => players.value.length >= 2 && isOwner.value && phase.value === 'lobby')

  function reset() {
    roomCode.value = null
    playerName.value = null
    mySocketId.value = null
    ownerSocketId.value = null
    phase.value = 'idle'
    countdown.value = null
    round.value = 1
    players.value = []
    leaderboard.value = []
    battleSeed.value = null
    notifications.value = []
    error.value = null
  }

  function addNotification(message) {
    const id = Date.now() + Math.random()
    notifications.value.push({ id, message })
    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, 4000)
  }

  return {
    roomCode,
    playerName,
    mySocketId,
    ownerSocketId,
    phase,
    countdown,
    round,
    players,
    leaderboard,
    battleSeed,
    notifications,
    error,
    isOwner,
    canStart,
    reset,
    addNotification,
  }
})
