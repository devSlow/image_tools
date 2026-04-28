<template>
  <Teleport to="body">
    <div v-if="store.cropModalVisible" class="crop-modal-overlay" @keydown.escape="cancel">
      <div class="crop-modal">
        <div class="crop-header">
          <h3>裁剪照片 — 2寸 (35×49mm)</h3>
          <button class="btn-close" @click="cancel">×</button>
        </div>
        <div class="crop-body">
          <div class="crop-canvas-area" ref="canvasArea">
            <canvas ref="mainCanvas" @mousedown="onMouseDown" />
            <canvas
              ref="overlayCanvas"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
              @mouseleave="onMouseUp"
            />
          </div>
          <div class="crop-sidebar">
            <div class="preview-section">
              <p class="section-title">预览</p>
              <canvas ref="previewCanvas" class="preview-canvas" />
            </div>
            <div class="crop-tips">
              <p>在图片上拖拽框选裁剪区域</p>
              <p>宽高比已锁定为 35:49</p>
              <p>拖动框体可移动位置</p>
              <p>拖动角点可调整大小</p>
            </div>
          </div>
        </div>
        <div class="crop-footer">
          <button class="btn btn-secondary" @click="reset">重选</button>
          <button class="btn btn-secondary" @click="cancel">取消</button>
          <button class="btn btn-primary" :disabled="!crop.hasCrop.value" @click="confirm">确认裁剪</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { usePhotoStore } from '../stores/photoStore'
import { useCrop } from '../composables/useCrop'
import { loadImage, cropAndResize } from '../utils/image'
import { PHOTO_WIDTH_300DPI, PHOTO_HEIGHT_300DPI } from '../utils/constants'

const store = usePhotoStore()
const mainCanvas = ref<HTMLCanvasElement | null>(null)
const overlayCanvas = ref<HTMLCanvasElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const canvasArea = ref<HTMLDivElement | null>(null)

const crop = useCrop(mainCanvas, overlayCanvas)
const { handleMouseDown, handleMouseMove, handleMouseUp } = crop

let currentImg: HTMLImageElement | null = null

function getActiveImage() {
  const id = store.activeCropImageId
  if (!id) return null
  for (const g of store.groups) {
    const img = g.rawImages.find(r => r.id === id)
    if (img) return img
  }
  return null
}

async function initCanvas() {
  const raw = getActiveImage()
  if (!raw || !mainCanvas.value || !overlayCanvas.value) return

  currentImg = await loadImage(raw.objectUrl)

  const area = canvasArea.value!
  // Use offsetWidth/Height for actual rendered size
  const canvasW = area.offsetWidth
  const canvasH = area.offsetHeight

  // Set both internal pixels and CSS size to match exactly
  mainCanvas.value.width = canvasW
  mainCanvas.value.height = canvasH
  mainCanvas.value.style.width = canvasW + 'px'
  mainCanvas.value.style.height = canvasH + 'px'

  overlayCanvas.value.width = canvasW
  overlayCanvas.value.height = canvasH
  overlayCanvas.value.style.width = canvasW + 'px'
  overlayCanvas.value.style.height = canvasH + 'px'

  crop.fitImageToCanvas(currentImg.naturalWidth, currentImg.naturalHeight, canvasW, canvasH)

  const ctx = mainCanvas.value.getContext('2d')!
  const t = crop.imageTransform.value
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.drawImage(currentImg, t.offsetX, t.offsetY, t.displayWidth, t.displayHeight)

  crop.resetCrop()
  updatePreview()
}

function updatePreview() {
  if (!previewCanvas.value) return

  // Set preview canvas internal size to match CSS size
  const previewRect = previewCanvas.value.getBoundingClientRect()
  if (previewCanvas.value.width !== Math.round(previewRect.width) ||
      previewCanvas.value.height !== Math.round(previewRect.height)) {
    previewCanvas.value.width = Math.round(previewRect.width)
    previewCanvas.value.height = Math.round(previewRect.height)
  }

  const pCtx = previewCanvas.value.getContext('2d')!
  const pw = previewCanvas.value.width
  const ph = previewCanvas.value.height

  pCtx.clearRect(0, 0, pw, ph)
  pCtx.fillStyle = '#f0f0f0'
  pCtx.fillRect(0, 0, pw, ph)

  if (!crop.hasCrop.value || !currentImg) return

  const region = crop.getCropRegion()
  if (!region || region.width <= 0 || region.height <= 0) return

  // Draw preview
  const scale = Math.min(pw / region.width, ph / region.height)
  const dw = region.width * scale
  const dh = region.height * scale
  const dx = (pw - dw) / 2
  const dy = (ph - dh) / 2
  pCtx.drawImage(
    currentImg,
    region.x, region.y, region.width, region.height,
    dx, dy, dw, dh,
  )
}

function onMouseDown(e: MouseEvent) { handleMouseDown(e) }
function onMouseMove(e: MouseEvent) { handleMouseMove(e); updatePreview() }
function onMouseUp() { handleMouseUp() }

function reset() {
  crop.resetCrop()
  updatePreview()
}

function cancel() {
  store.closeCropModal()
}

async function confirm() {
  if (!crop.hasCrop.value || !currentImg) return
  const region = crop.getCropRegion()
  if (!region) return

  const dataUrl = cropAndResize(currentImg, region, PHOTO_WIDTH_300DPI, PHOTO_HEIGHT_300DPI)
  const rawImageId = store.activeCropImageId!
  store.setCroppedPhoto(rawImageId, {
    id: `cropped-${Date.now()}`,
    sourceImageId: rawImageId,
    dataUrl,
    widthPx: PHOTO_WIDTH_300DPI,
    heightPx: PHOTO_HEIGHT_300DPI,
  })
  store.closeCropModal()
}

watch(() => store.cropModalVisible, async (visible) => {
  if (visible) {
    await nextTick()
    initCanvas()
  }
})

onMounted(() => {
  if (store.cropModalVisible) {
    nextTick(() => initCanvas())
  }
})

onUnmounted(() => {
  currentImg = null
})
</script>

<style scoped>
.crop-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.crop-modal {
  background: white;
  border-radius: 12px;
  width: 90vw;
  max-width: 1000px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.crop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
}
.crop-header h3 {
  margin: 0;
  font-size: 16px;
}
.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}
.crop-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.crop-canvas-area {
  flex: 1;
  position: relative;
  background: #2a2a2a;
}
.crop-canvas-area canvas {
  position: absolute;
  top: 0;
  left: 0;
}
.crop-sidebar {
  width: 200px;
  padding: 16px;
  border-left: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.section-title {
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 8px;
  color: #666;
}
.preview-canvas {
  width: 100%;
  aspect-ratio: 35/49;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.crop-tips {
  font-size: 12px;
  color: #888;
  line-height: 1.6;
}
.crop-tips p {
  margin: 0;
}
.crop-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #eee;
}
.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.btn-primary {
  background: #4a90d9;
  color: white;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-secondary {
  background: #f0f0f0;
  color: #333;
}
</style>
