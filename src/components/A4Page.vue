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
  MARGIN_TOP_MM, MARGIN_LEFT_MM,
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

  // 打印级渲染：300 DPI，与打印输出完全一致
  canvas.width = A4_WIDTH_300DPI
  canvas.height = A4_HEIGHT_300DPI

  // 显示尺寸：按 A4 比例缩放，确保预览和打印宽高比一致
  canvas.style.width = '100%'
  canvas.style.height = 'auto'

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const pxPerMm = canvas.width / A4_WIDTH_MM
  let currentY = MARGIN_TOP_MM * pxPerMm

  for (const row of props.page.rows) {
    const photoW = PHOTO_WIDTH_MM * pxPerMm
    const photoH = PHOTO_HEIGHT_MM * pxPerMm
    const gap = PHOTO_GAP_MM * pxPerMm
    const startX = MARGIN_LEFT_MM * pxPerMm

    // 画照片
    for (let i = 0; i < row.photos.length; i++) {
      const photo = row.photos[i]
      const x = startX + i * (photoW + gap)
      try {
        const img = await loadImage(photo.dataUrl)
        ctx.drawImage(img, x, currentY, photoW, photoH)
      } catch {
        ctx.fillStyle = '#e0e0e0'
        ctx.fillRect(x, currentY, photoW, photoH)
      }
    }

    // 切割线（虚线）
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = '#bbbbbb'
    ctx.lineWidth = 1

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

    // 垂直分割线
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
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  margin: 0 auto;
  width: 100%;
  max-width: 500px;
}
.a4-canvas {
  display: block;
  width: 100%;
  height: auto;
}
</style>
