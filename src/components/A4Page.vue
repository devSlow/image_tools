<template>
  <div class="a4-page-wrapper">
    <canvas ref="pageCanvas" class="a4-canvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { loadImage } from '../utils/image'
import type { A4LayoutPage } from '../types'
import {
  A4_WIDTH_MM,
  MARGIN_TOP_MM,
  PHOTO_WIDTH_MM, PHOTO_HEIGHT_MM, PHOTO_GAP_MM, PHOTOS_PER_ROW,
  A4_WIDTH_300DPI, A4_HEIGHT_300DPI,
} from '../utils/constants'

const props = defineProps<{
  page: A4LayoutPage
}>()

const pageCanvas = ref<HTMLCanvasElement | null>(null)

async function renderPage() {
  const canvas = pageCanvas.value
  if (!canvas) return

  // Use 300 DPI for sharp print
  canvas.width = A4_WIDTH_300DPI
  canvas.height = A4_HEIGHT_300DPI

  // CSS display size: use max-width to fit container, maintain A4 aspect ratio
  canvas.style.width = '100%'
  canvas.style.height = 'auto'

  const ctx = canvas.getContext('2d')!

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const pxPerMm = canvas.width / A4_WIDTH_MM // pixels per mm at 300DPI

  let currentY = MARGIN_TOP_MM * pxPerMm

  for (const row of props.page.rows) {
    const photoW = PHOTO_WIDTH_MM * pxPerMm
    const photoH = PHOTO_HEIGHT_MM * pxPerMm
    const gap = PHOTO_GAP_MM * pxPerMm
    const totalRowWidth = PHOTOS_PER_ROW * photoW + (PHOTOS_PER_ROW - 1) * gap
    const startX = (canvas.width - totalRowWidth) / 2 // Center

    // Draw photos
    for (let i = 0; i < row.photos.length; i++) {
      const photo = row.photos[i]
      const x = startX + i * (photoW + gap)

      try {
        const img = await loadImage(photo.dataUrl)
        ctx.drawImage(img, x, currentY, photoW, photoH)
      } catch {
        // Fallback: gray placeholder
        ctx.fillStyle = '#e0e0e0'
        ctx.fillRect(x, currentY, photoW, photoH)
      }
    }

    // Draw cut lines (dashed)
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = '#bbbbbb'
    ctx.lineWidth = 1

    // Horizontal lines (top and bottom of row, through gap center)
    const topLineY = currentY - gap / 2
    const bottomLineY = currentY + photoH + gap / 2

    ctx.beginPath()
    ctx.moveTo(startX - gap / 2, topLineY)
    ctx.lineTo(startX + totalRowWidth + gap / 2, topLineY)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(startX - gap / 2, bottomLineY)
    ctx.lineTo(startX + totalRowWidth + gap / 2, bottomLineY)
    ctx.stroke()

    // Vertical lines (between each photo)
    for (let i = 0; i <= row.photos.length; i++) {
      const lineX = startX + i * (photoW + gap) - gap / 2
      ctx.beginPath()
      ctx.moveTo(lineX, topLineY)
      ctx.lineTo(lineX, bottomLineY)
      ctx.stroke()
    }

    ctx.setLineDash([])

    currentY += photoH + gap
  }
}

watch(() => props.page, () => nextTick(renderPage), { deep: true })
onMounted(() => nextTick(renderPage))
</script>

<style scoped>
.a4-page-wrapper {
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
  width: 100%;
  max-width: 500px;
}
.a4-canvas {
  display: block;
}
</style>
