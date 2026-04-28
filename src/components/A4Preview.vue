<template>
  <div class="a4-preview">
    <div v-if="!layoutResult" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p>上传照片并裁剪后，这里将预览A4排版效果</p>
    </div>
    <template v-else>
      <div class="pages-container">
        <A4Page
          v-for="page in layoutResult.pages"
          :key="page.pageNumber"
          :page="page"
        />
      </div>
      <div v-if="layoutResult.totalPages > 1" class="page-indicator">
        共 {{ layoutResult.totalPages }} 页
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useLayout } from '../composables/useLayout'
import A4Page from './A4Page.vue'

const { layoutResult } = useLayout()
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #aaa;
}
.empty-state p {
  margin-top: 12px;
  font-size: 14px;
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
