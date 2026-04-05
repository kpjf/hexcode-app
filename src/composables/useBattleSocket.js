import { io } from 'socket.io-client'
import { useBattleStore } from '../stores/battle.js'

// Derive socket URL from data API URL by stripping the /api suffix
function getSocketUrl() {
  const dataApiUrl = import.meta.env.VITE_DATA_API_URL || 'http://localhost:3000/api'
  return dataApiUrl.replace(/\/api$/, '')
}

let socket = null

export function useBattleSocket() {
  const store = useBattleStore()

  function connect() {
    if (socket?.connected) return

    socket = io(`${getSocketUrl()}/battle`, {
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      store.mySocketId = socket.id
    })

    socket.on('room:created', ({ roomCode }) => {
      store.roomCode = roomCode
    })

    socket.on('room:joined', ({ roomCode }) => {
      store.roomCode = roomCode
    })

    socket.on('room:updated', ({ players, phase, round, ownerSocketId }) => {
      store.players = players
      store.phase = phase
      store.round = round
      store.ownerSocketId = ownerSocketId
    })

    socket.on('game:countdown', ({ seconds }) => {
      store.countdown = seconds
      store.phase = 'countdown'
    })

    socket.on('game:go', ({ seed }) => {
      store.battleSeed = seed
      store.phase = 'playing'
    })

    socket.on('player:cracked', ({ name }) => {
      store.addNotification(`${name} cracked the code! Keep going!`)
    })

    socket.on('player:correct-peg', ({ name }) => {
      store.addNotification(`${name} got a correct color and position!`)
    })

    socket.on('player:danger', ({ name }) => {
      store.addNotification(`${name} is on their last guess!`)
    })

    socket.on('game:results', ({ leaderboard }) => {
      store.leaderboard = leaderboard
      store.phase = 'finished'
    })

    socket.on('error', ({ message }) => {
      store.error = message
    })
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
    store.reset()
  }

  function createRoom(playerName) {
    connect()
    store.playerName = playerName
    store.error = null
    socket.emit('room:create', { playerName })
  }

  function joinRoom(roomCode, playerName) {
    connect()
    store.playerName = playerName
    store.error = null
    socket.emit('room:join', { roomCode: roomCode.toUpperCase(), playerName })
  }

  function startGame() {
    socket?.emit('game:start', { roomCode: store.roomCode })
  }

  function reportFinished(durationSeconds) {
    socket?.emit('player:finished', { roomCode: store.roomCode, durationSeconds })
  }

  function reportDnf() {
    socket?.emit('player:dnf', { roomCode: store.roomCode })
  }

  function reportCorrectPeg() {
    socket?.emit('player:correct-peg', { roomCode: store.roomCode })
  }

  function reportDanger() {
    socket?.emit('player:danger', { roomCode: store.roomCode })
  }

  function goAgain() {
    socket?.emit('game:again', { roomCode: store.roomCode })
  }

  return {
    connect,
    disconnect,
    createRoom,
    joinRoom,
    startGame,
    reportFinished,
    reportDnf,
    reportCorrectPeg,
    reportDanger,
    goAgain,
  }
}
