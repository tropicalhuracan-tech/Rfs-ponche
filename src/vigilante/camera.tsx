import React, { useCallback, useEffect, useRef, useState } from 'react'

type CameraCaptureProps = {
  open: boolean
  torchOn: boolean
  onTorchChange: (on: boolean) => void
  onClose: () => void
  onCapture: (dataUrl: string) => void
}

function supportsTorch(track: MediaStreamTrack | null) {
  if (!track) return false
  const caps = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }
  return !!caps?.torch
}

export function CameraCapture({ open, torchOn, onTorchChange, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [torchSupported, setTorchSupported] = useState(false)

  const stopStream = useCallback(() => {
    const stream = streamRef.current
    if (stream) {
      for (const track of stream.getTracks()) track.stop()
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open) {
      stopStream()
      return
    }
    let cancelled = false
    setError('')
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop()
          return
        }
        streamRef.current = stream
        const track = stream.getVideoTracks()[0] ?? null
        setTorchSupported(supportsTorch(track))
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo abrir la cámara')
      }
    })()
    return () => {
      cancelled = true
      stopStream()
    }
  }, [open, stopStream])

  useEffect(() => {
    if (!open) return
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track || !supportsTorch(track)) return
    void track
      .applyConstraints({ advanced: [{ torch: torchOn }] as MediaTrackConstraintSet[] })
      .catch(() => {
        onTorchChange(false)
      })
  }, [open, torchOn, onTorchChange])

  const snap = () => {
    const video = videoRef.current
    if (!video) return
    const w = video.videoWidth
    const h = video.videoHeight
    if (!w || !h) return
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, w, h)
    onCapture(canvas.toDataURL('image/jpeg', 0.92))
    stopStream()
    onClose()
  }

  if (!open) return null

  return (
    <div className="camera-overlay" role="dialog" aria-label="Tomar foto">
      <div className="camera-sheet">
        {error ? (
          <p className="setup-error">{error}</p>
        ) : (
          <video ref={videoRef} className="camera-preview" playsInline muted />
        )}
        <div className="camera-toolbar">
          {torchSupported ? (
            <button
              type="button"
              className={`flash-btn ${torchOn ? 'is-on' : ''}`}
              onClick={() => onTorchChange(!torchOn)}
              aria-pressed={torchOn}
            >
              {torchOn ? 'Flash ON' : 'Flash'}
            </button>
          ) : null}
          <button type="button" className="secondary-btn" onClick={() => { stopStream(); onClose() }}>
            Cancelar
          </button>
          <button type="button" className="primary-btn" onClick={snap} disabled={!!error}>
            Capturar
          </button>
        </div>
      </div>
    </div>
  )
}

export function useCameraCaptureFallback() {
  const fileRef = useRef<HTMLInputElement>(null)
  const openFilePicker = () => fileRef.current?.click()
  return { fileRef, openFilePicker }
}
