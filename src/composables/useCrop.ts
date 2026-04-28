import { ref, type Ref } from 'vue'
import { CROP_ASPECT_RATIO } from '../utils/constants'
import type { CropRegion } from '../types'

interface ImageTransform {
  offsetX: number
  offsetY: number
  scale: number
  displayWidth: number
  displayHeight: number
}

interface CropBox {
  x: number
  y: number
  width: number
  height: number
}

type DragMode = 'none' | 'drawing' | 'moving' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br'

export function useCrop(_mainCanvas: Ref<HTMLCanvasElement | null>, overlayCanvas: Ref<HTMLCanvasElement | null>) {
  const isDragging = ref(false)
  const cropBox = ref<CropBox>({ x: 0, y: 0, width: 0, height: 0 })
  const hasCrop = ref(false)
  const imageTransform = ref<ImageTransform>({
    offsetX: 0, offsetY: 0, scale: 1, displayWidth: 0, displayHeight: 0,
  })

  let dragMode: DragMode = 'none'
  let dragStartX = 0
  let dragStartY = 0
  let cropStartBox: CropBox | null = null

  function fitImageToCanvas(
    imgWidth: number,
    imgHeight: number,
    canvasWidth: number,
    canvasHeight: number,
  ) {
    const padding = 20
    const availW = canvasWidth - padding * 2
    const availH = canvasHeight - padding * 2
    const scale = Math.min(availW / imgWidth, availH / imgHeight)
    const displayW = imgWidth * scale
    const displayH = imgHeight * scale
    const offsetX = (canvasWidth - displayW) / 2
    const offsetY = (canvasHeight - displayH) / 2

    imageTransform.value = {
      offsetX, offsetY, scale,
      displayWidth: displayW,
      displayHeight: displayH,
    }
  }

  function canvasToImage(cx: number, cy: number) {
    const t = imageTransform.value
    return {
      x: (cx - t.offsetX) / t.scale,
      y: (cy - t.offsetY) / t.scale,
    }
  }

  function getCropRegion(): CropRegion | null {
    if (!hasCrop.value) return null
    const box = cropBox.value
    const tl = canvasToImage(box.x, box.y)
    const br = canvasToImage(box.x + box.width, box.y + box.height)
    return {
      x: Math.max(0, tl.x),
      y: Math.max(0, tl.y),
      width: br.x - tl.x,
      height: br.y - tl.y,
    }
  }

  function clampBox(box: CropBox): CropBox {
    const t = imageTransform.value
    const imgLeft = t.offsetX
    const imgTop = t.offsetY
    const imgRight = t.offsetX + t.displayWidth
    const imgBottom = t.offsetY + t.displayHeight

    let { x, y, width, height } = box

    if (x < imgLeft) {
      width -= (imgLeft - x)
      x = imgLeft
    }
    if (y < imgTop) {
      height -= (imgTop - y)
      y = imgTop
    }
    if (x + width > imgRight) {
      width = imgRight - x
    }
    if (y + height > imgBottom) {
      height = imgBottom - y
    }

    // 重新按比例修正
    height = width / CROP_ASPECT_RATIO
    if (y + height > imgBottom) {
      height = imgBottom - y
      width = height * CROP_ASPECT_RATIO
    }

    return { x, y, width: Math.max(1, width), height: Math.max(1, height) }
  }

  function getHitZone(cx: number, cy: number): DragMode {
    if (!hasCrop.value) return 'none'
    const box = cropBox.value
    const handleSize = 12

    const nearLeft = Math.abs(cx - box.x) < handleSize
    const nearRight = Math.abs(cx - (box.x + box.width)) < handleSize
    const nearTop = Math.abs(cy - box.y) < handleSize
    const nearBottom = Math.abs(cy - (box.y + box.height)) < handleSize

    if (nearLeft && nearTop) return 'resize-tl'
    if (nearRight && nearTop) return 'resize-tr'
    if (nearLeft && nearBottom) return 'resize-bl'
    if (nearRight && nearBottom) return 'resize-br'

    if (cx > box.x && cx < box.x + box.width && cy > box.y && cy < box.y + box.height) {
      return 'moving'
    }

    return 'none'
  }

  function handleMouseDown(e: MouseEvent) {
    const canvas = overlayCanvas.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const hit = getHitZone(cx, cy)
    if (hit !== 'none') {
      dragMode = hit
      dragStartX = cx
      dragStartY = cy
      cropStartBox = { ...cropBox.value }
      isDragging.value = true
      return
    }

    // Start new crop
    const t = imageTransform.value
    if (cx < t.offsetX || cx > t.offsetX + t.displayWidth ||
        cy < t.offsetY || cy > t.offsetY + t.displayHeight) {
      return
    }

    dragMode = 'drawing'
    dragStartX = cx
    dragStartY = cy
    cropBox.value = { x: cx, y: cy, width: 0, height: 0 }
    hasCrop.value = false
    isDragging.value = true
  }

  function handleMouseMove(e: MouseEvent) {
    const canvas = overlayCanvas.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    if (dragMode === 'none') {
      // Update cursor
      const hit = getHitZone(cx, cy)
      if (hit === 'resize-tl' || hit === 'resize-br') canvas.style.cursor = 'nwse-resize'
      else if (hit === 'resize-tr' || hit === 'resize-bl') canvas.style.cursor = 'nesw-resize'
      else if (hit === 'moving') canvas.style.cursor = 'move'
      else canvas.style.cursor = 'crosshair'
      return
    }

    const dx = cx - dragStartX
    const dy = cy - dragStartY
    const startBox = cropStartBox!

    if (dragMode === 'drawing') {
      let cropW: number, cropH: number

      if (Math.abs(dx) / CROP_ASPECT_RATIO > Math.abs(dy)) {
        cropW = Math.abs(dx)
        cropH = cropW / CROP_ASPECT_RATIO
      } else {
        cropH = Math.abs(dy)
        cropW = cropH * CROP_ASPECT_RATIO
      }

      const startX = dx >= 0 ? dragStartX : dragStartX - cropW
      const startY = dy >= 0 ? dragStartY : dragStartY - cropH

      const clamped = clampBox({ x: startX, y: startY, width: cropW, height: cropH })
      cropBox.value = clamped
      hasCrop.value = clamped.width > 5 && clamped.height > 5

    } else if (dragMode === 'moving') {
      const t = imageTransform.value
      let newX = startBox.x + dx
      let newY = startBox.y + dy
      // Clamp position
      newX = Math.max(t.offsetX, Math.min(newX, t.offsetX + t.displayWidth - startBox.width))
      newY = Math.max(t.offsetY, Math.min(newY, t.offsetY + t.displayHeight - startBox.height))
      cropBox.value = { ...startBox, x: newX, y: newY }

    } else if (dragMode.startsWith('resize')) {
      const isLeft = dragMode === 'resize-tl' || dragMode === 'resize-bl'
      const isTop = dragMode === 'resize-tl' || dragMode === 'resize-tr'

      let newW = startBox.width + (isLeft ? -dx : dx)
      let newH = newW / CROP_ASPECT_RATIO

      // Check height constraint
      const t = imageTransform.value
      if (isTop) {
        const maxH = startBox.y + startBox.height - t.offsetY
        if (newH > maxH) {
          newH = maxH
          newW = newH * CROP_ASPECT_RATIO
        }
      } else {
        const maxH = t.offsetY + t.displayHeight - (startBox.y + startBox.height - startBox.height)
        if (newH > maxH) {
          newH = maxH
          newW = newH * CROP_ASPECT_RATIO
        }
      }

      if (newW < 20) { newW = 20; newH = newW / CROP_ASPECT_RATIO }

      let newX = isLeft ? startBox.x + startBox.width - newW : startBox.x
      let newY = isTop ? startBox.y + startBox.height - newH : startBox.y

      cropBox.value = clampBox({ x: newX, y: newY, width: newW, height: newH })
      hasCrop.value = true
    }

    drawOverlay()
  }

  function handleMouseUp() {
    dragMode = 'none'
    isDragging.value = false
  }

  function drawOverlay() {
    const canvas = overlayCanvas.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    if (!hasCrop.value) return
    const box = cropBox.value

    // Semi-transparent mask
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillRect(0, 0, w, box.y)
    ctx.fillRect(0, box.y + box.height, w, h - box.y - box.height)
    ctx.fillRect(0, box.y, box.x, box.height)
    ctx.fillRect(box.x + box.width, box.y, w - box.x - box.width, box.height)

    // Border - outer dark line + inner white line for visibility
    ctx.lineWidth = 4
    ctx.strokeStyle = '#000'
    ctx.strokeRect(box.x, box.y, box.width, box.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = '#fff'
    ctx.strokeRect(box.x, box.y, box.width, box.height)

    // Rule of thirds
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 1; i <= 2; i++) {
      ctx.moveTo(box.x, box.y + box.height * i / 3)
      ctx.lineTo(box.x + box.width, box.y + box.height * i / 3)
      ctx.moveTo(box.x + box.width * i / 3, box.y)
      ctx.lineTo(box.x + box.width * i / 3, box.y + box.height)
    }
    ctx.stroke()

    // Corner handles - larger with dark border
    const corners = [
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x, box.y + box.height],
      [box.x + box.width, box.y + box.height],
    ]
    for (const [cx, cy] of corners) {
      ctx.fillStyle = '#000'
      ctx.fillRect(cx - 7, cy - 7, 14, 14)
      ctx.fillStyle = '#fff'
      ctx.fillRect(cx - 5, cy - 5, 10, 10)
    }
  }

  function resetCrop() {
    cropBox.value = { x: 0, y: 0, width: 0, height: 0 }
    hasCrop.value = false
    drawOverlay()
  }

  return {
    cropBox,
    hasCrop,
    isDragging,
    imageTransform,
    fitImageToCanvas,
    getCropRegion,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    drawOverlay,
    resetCrop,
  }
}
