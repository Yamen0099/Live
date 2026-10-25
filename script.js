const root = document.documentElement
const progress = document.querySelector('.scroll-progress span')
const playButton = document.querySelector('#playButton')
const progressBar = document.querySelector('#progressBar')
const elapsed = document.querySelector('#elapsed')
const trackTitle = document.querySelector('.track-title')
const trackArtist = document.querySelector('.track-artist')
const trackCount = document.querySelector('.track-count')
const youtubeLink = document.querySelector('.youtube-link')
const songs = document.querySelectorAll('.song-row')

let isPlaying = false
let playback = 0
let timer
let youtubePlayer
let playerReady = false
const trackDuration = 714

function updateScroll () {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const ratio = max > 0 ? window.scrollY / max : 0
  root.style.setProperty('--scroll-y', `${window.scrollY}px`)
  progress.style.width = `${ratio * 100}%`
}

function formatTime (seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${rest}`
}

function syncPlayback () {
  if (!youtubePlayer || !playerReady) return
  playback = youtubePlayer.getCurrentTime()
  const duration = youtubePlayer.getDuration() || trackDuration
  progressBar.style.width = `${Math.min((playback / duration) * 100, 100)}%`
  elapsed.textContent = formatTime(playback)
}

function setPlaying (value) {
  isPlaying = value
  playButton.classList.toggle('is-playing', isPlaying)
  playButton.querySelector('.play-icon').textContent = isPlaying ? 'Ⅱ' : '▶'
  if (isPlaying) {
    if (playerReady) youtubePlayer.playVideo()
    window.clearInterval(timer)
    timer = window.setInterval(syncPlayback, 1000)
  } else {
    if (playerReady) youtubePlayer.pauseVideo()
    window.clearInterval(timer)
    syncPlayback()
  }
}

window.onYouTubeIframeAPIReady = () => {
  youtubePlayer = new YT.Player('youtubePlayer', {
    events: {
      onReady: () => {
        playerReady = true
        if (isPlaying) youtubePlayer.playVideo()
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING && !isPlaying) setPlaying(true)
        if ((event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) && isPlaying) setPlaying(false)
      }
    }
  })
}

playButton.addEventListener('click', () => setPlaying(!isPlaying))

songs.forEach((song) => {
  song.addEventListener('click', () => {
    songs.forEach((item) => item.classList.remove('active'))
    song.classList.add('active')
    trackTitle.textContent = song.dataset.song
    trackArtist.textContent = song.dataset.artist
    playback = 0
    progressBar.style.width = '0%'
    elapsed.textContent = '00:00'
    youtubeLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.dataset.artist} ${song.dataset.song}`)}`
    if (isPlaying) setPlaying(true)
  })
})

window.addEventListener('scroll', updateScroll, { passive: true })
window.addEventListener('resize', updateScroll)
updateScroll()
