<template>
  <div class="photo-list">
    <div class="list-header" v-if="store.groups.length > 0">
      <span class="count">共 {{ store.groups.length }} 人</span>
      <span class="progress">{{ croppedCount }}/{{ store.groups.length }} 已裁剪</span>
    </div>
    <div class="list-scroll">
      <PhotoGroup
        v-for="group in store.groups"
        :key="group.id"
        :group="group"
        @remove="store.removeGroup(group.id)"
        @recrop="store.openCropModal(group.rawImages[0]?.id)"
      />
      <UploadArea />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePhotoStore } from '../stores/photoStore'
import PhotoGroup from './PhotoGroup.vue'
import UploadArea from './UploadArea.vue'

const store = usePhotoStore()

const croppedCount = computed(() =>
  store.groups.filter(g => g.croppedPhotos.length > 0).length,
)
</script>

<style scoped>
.photo-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.list-header {
  display: flex;
  justify-content: space-between;
  padding: 0 2px 8px;
  font-size: 12px;
  color: #888;
  flex-shrink: 0;
}
.progress {
  color: #4caf50;
  font-weight: 500;
}
.list-scroll {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}
.list-scroll::-webkit-scrollbar {
  width: 5px;
}
.list-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.list-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
.list-scroll::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
