import { onMounted, onUnmounted } from 'vue'

async function fetchETag() {
  try {
    const res = await fetch('/', { method: 'HEAD', cache: 'no-store' })
    return res.headers.get('etag') || res.headers.get('last-modified')
  } catch {
    return null
  }
}

export function useVersionCheck() {
  let initialETag = null

  const check = async () => {
    const current = await fetchETag()
    if (current && initialETag && current !== initialETag) {
      window.location.reload()
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') check()
  }

  onMounted(async () => {
    initialETag = await fetchETag()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })
}
