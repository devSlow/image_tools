<template>
  <div class="a4-preview">
    <div v-if="!store.layoutResult" class="empty-state">
      <div class="empty-card">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <h2 class="empty-title">A4 排版预览</h2>
        <p class="empty-desc">上传照片并裁剪后，这里将预览排版效果</p>
      </div>
    </div>
    <template v-else>
      <div class="pages-container">
        <A4Page
          v-for="page in store.layoutResult.pages"
          :key="page.pageNumber"
          :page="page"
        />
      </div>
      <div v-if="store.layoutResult.totalPages > 1" class="page-indicator">
        共 {{ store.layoutResult.totalPages }} 页
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePhotoStore } from '../stores/photoStore'
import A4Page from './A4Page.vue'

const store = usePhotoStore()
</script>

<style scoped>
.a4-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  overflow-y: auto;
  min-height: 0;
}
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 400px;
}
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 320px;
  padding: 48px 32px;
  background: #fafafa;
  border: 1.5px dashed #ddd;
  border-radius: 16px;
}
.empty-title {
  margin: 20px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #888;
}
.empty-desc {
  margin: 0;
  font-size: 14px;
  color: #aaa;
}
.pages-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transform-origin: top center;
}
.page-indicator {
  margin-top: 12px;
  font-size: 13px;
  color: #888;
}
</style>
