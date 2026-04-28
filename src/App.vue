<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { usePhotoStore } from './stores/photoStore'
import { useUpload } from './composables/useUpload'
import { loadImage } from './utils/image'
import { calculateLayout } from './utils/layout'
import {
  A4_WIDTH_300DPI, A4_HEIGHT_300DPI,
  A4_WIDTH_MM,
  MARGIN_TOP_MM,
  PHOTO_WIDTH_MM, PHOTO_HEIGHT_MM, PHOTO_GAP_MM, PHOTOS_PER_ROW,
} from './utils/constants'
import Toolbar from './components/Toolbar.vue'
import PhotoList from './components/PhotoList.vue'
import A4Preview from './components/A4Preview.vue'
import CropModal from './components/CropModal.vue'

const store = usePhotoStore()
const { handleFiles } = useUpload()
const fileInput = ref<HTMLInputElement | null>(null)
const previewArea = ref<HTMLDivElement | null>(null)

// 裁剪完成后自动滚动到预览区域
watch(() => store.cropModalVisible, (visible, oldVisible) => {
  if (oldVisible && !visible) {
    nextTick(() => {
      previewArea.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
})

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
    input.value = ''
  }
}

async function handlePrint() {
  const printedGroups = store.groups.filter(g => g.croppedPhotos.length > 0 && store.isPrinted(g.id))
  const unprintedGroups = store.groups.filter(g => g.croppedPhotos.length > 0 && !store.isPrinted(g.id))

  if (unprintedGroups.length === 0) {
    alert('所有照片都已打印过了')
    return
  }

  if (printedGroups.length > 0) {
    const confirmed = confirm(`${printedGroups.length} 组照片已打印，是否继续打印剩余的 ${unprintedGroups.length} 组？`)
    if (!confirmed) return
  }

  const layout = calculateLayout(unprintedGroups)

  const printWindow = window.open('', '_blank')!
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: A4 portrait; margin: 0; }
  body { margin: 0; padding: 0; }
  .a4-print-page { width: 210mm; height: 297mm; page-break-after: always; margin: 0; }
  .a4-print-page:last-child { page-break-after: auto; }
  .a4-print-page canvas { width: 210mm; height: 297mm; display: block; }
.preview-wrapper {
  flex: 1;
  display: flex;
  min-width: 0;
}
</style>
</head>
<body><div id="pages"></div></body>
</html>`)
  printWindow.document.close()

  const container = printWindow.document.getElementById('pages')!

  for (const page of layout.pages) {
    const pageDiv = printWindow.document.createElement('div')
    pageDiv.className = 'a4-print-page'
    const canvas = printWindow.document.createElement('canvas')
    canvas.width = A4_WIDTH_300DPI
    canvas.height = A4_HEIGHT_300DPI
    pageDiv.appendChild(canvas)
    container.appendChild(pageDiv)

    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const pxPerMm = canvas.width / A4_WIDTH_MM
    let currentY = MARGIN_TOP_MM * pxPerMm

    for (const row of page.rows) {
      const photoW = PHOTO_WIDTH_MM * pxPerMm
      const photoH = PHOTO_HEIGHT_MM * pxPerMm
      const gap = PHOTO_GAP_MM * pxPerMm
      const totalRowWidth = PHOTOS_PER_ROW * photoW + (PHOTOS_PER_ROW - 1) * gap
      const startX = (canvas.width - totalRowWidth) / 2

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

      // Cut lines
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

  setTimeout(() => {
    printWindow.print()
    store.markPrinted(unprintedGroups.map(g => g.id))
  }, 800)
}
</script>

<template>
  <input
    ref="fileInput"
    type="file"
    multiple
    accept="image/*"
    style="display: none"
    @change="onFileChange"
  />
  <Toolbar @upload="triggerUpload" @print="handlePrint" />
  <div class="app-layout">
    <div class="sidebar">
      <PhotoList />
      <div class="copyright">© 2026 郎溪县残疾人联合会</div>
    </div>
    <div ref="previewArea" class="preview-wrapper">
      <A4Preview />
    </div>
  </div>
  <CropModal />
</template>

<style scoped>
.preview-wrapper {
  flex: 1;
  display: flex;
  min-width: 0;
}
.copyright {
  margin-top: auto;
  padding-top: 16px;
  text-align: center;
  font-size: 12px;
  color: #bbb;
}
</style>
