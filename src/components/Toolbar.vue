<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="menu-btn" @click="$emit('toggle-sidebar')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <h1 class="app-title">2寸证件照排版工具 <span class="copyright">郎溪县残疾人联合会</span></h1>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" @click="$emit('upload')">
        上传照片
      </button>
      <button
        class="btn"
        :disabled="!hasLayout"
        @click="$emit('print')"
      >
        打印
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePhotoStore } from '../stores/photoStore'

const store = usePhotoStore()

const hasLayout = computed(() => store.layoutResult !== null && store.layoutResult.totalPages > 0)

defineEmits<{
  upload: []
  print: []
  'toggle-sidebar': []
}>()
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.menu-btn {
  display: none;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
}
.app-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}
.app-title .copyright {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin-left: 8px;
}
.toolbar-actions {
  display: flex;
  gap: 8px;
}
.btn {
  padding: 8px 18px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  background: white;
  color: #333;
}
.btn:hover:not(:disabled) {
  background: #f5f5f5;
}
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-primary {
  background: #4a90d9;
  color: white;
  border-color: #4a90d9;
}
.btn-primary:hover:not(:disabled) {
  background: #4a90d9;
  color: white;
  border-color: #4a90d9;
}

@media (max-width: 768px) {
  .menu-btn {
    display: block;
  }
  .app-title {
    font-size: 15px;
  }
  .app-title .copyright {
    display: none;
  }
  .btn {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>
