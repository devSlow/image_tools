<template>
  <div
    class="upload-area"
    :class="{ dragover }"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop.prevent="onDrop"
    @click="triggerInput"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="onFileChange"
    />
    <div class="upload-hint">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p>点击或拖拽上传照片</p>
      <p class="sub">每张照片对应一个人物</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUpload } from '../composables/useUpload'

const { handleFiles } = useUpload()
const dragover = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerInput() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
    input.value = ''
  }
}

function onDrop(e: DragEvent) {
  dragover.value = false
  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files)
  }
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #888;
}
.upload-area:hover,
.upload-area.dragover {
  border-color: #4a90d9;
  color: #4a90d9;
  background: #f0f7ff;
}
.upload-hint svg {
  margin-bottom: 8px;
}
.upload-hint p {
  margin: 4px 0;
}
.sub {
  font-size: 12px;
  opacity: 0.7;
}
</style>
