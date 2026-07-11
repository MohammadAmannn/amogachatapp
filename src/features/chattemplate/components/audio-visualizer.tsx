import React, { useEffect, useRef } from 'react'

export function AudioVisualizer({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let audioCtx: AudioContext | null = null
    let analyser: AnalyserNode | null = null
    let dataArray: Uint8Array = new Uint8Array(0)

    // Setup audio context if stream is active
    if (stream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioCtx = new AudioContextClass()
        const source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64 // small fft size for smooth bar waves
        source.connect(analyser)
        const bufferLength = analyser.frequencyBinCount
        dataArray = new Uint8Array(bufferLength)
      } catch (err) {
        console.error("Web Audio visualizer setup failed, falling back to CSS animation:", err)
      }
    }

    const draw = (timestamp: number) => {
      animationId = requestAnimationFrame(draw)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = 4
      const gap = 3
      const padding = 10
      const usableWidth = canvas.width - padding * 2
      const numBars = Math.floor(usableWidth / (barWidth + gap))
      const startX = padding + (usableWidth - numBars * (barWidth + gap)) / 2

      // Retrieve audio data if available, else run synthetic wave animation
      let volumes: number[] = []
      if (analyser && dataArray.length > 0) {
        analyser.getByteFrequencyData(dataArray as any)
        // Map frequency bins to display bars
        for (let i = 0; i < numBars; i++) {
          const binIndex = Math.floor((i / numBars) * dataArray.length)
          volumes.push(dataArray[binIndex] || 0)
        }
      } else {
        // Fallback smooth animation using math sine waves
        for (let i = 0; i < numBars; i++) {
          const wave1 = Math.sin(timestamp * 0.004 + i * 0.15) * 20
          const wave2 = Math.cos(timestamp * 0.007 - i * 0.25) * 10
          volumes.push(Math.max(5, Math.abs(wave1 + wave2) * 1.5))
        }
      }

      // Draw the waveform bars centered vertically
      const midY = canvas.height / 2
      ctx.lineCap = 'round'
      
      // Draw shadow glow
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(56, 189, 248, 0.4)' // sky-400 glow

      for (let i = 0; i < numBars; i++) {
        const val = volumes[i]
        // Scale visualizer height
        const height = Math.max(4, Math.min(canvas.height - 8, (val / 255) * canvas.height * 1.2 || val))
        const x = startX + i * (barWidth + gap)
        const y = midY - height / 2

        // Set bar gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + height)
        gradient.addColorStop(0, '#38bdf8') // sky-400
        gradient.addColorStop(1, '#0284c7') // sky-600

        ctx.fillStyle = gradient
        
        // Draw round rect for each bar
        ctx.beginPath()
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, height, 2)
        } else {
          ctx.rect(x, y, barWidth, height)
        }
        ctx.fill()
      }
    }

    animationId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationId)
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close()
      }
    }
  }, [stream])

  return (
    <canvas 
      ref={canvasRef} 
      width={220} 
      height={32} 
      className="w-full max-w-[240px] h-8 shrink-0 bg-transparent block"
    />
  )
}
export default AudioVisualizer
