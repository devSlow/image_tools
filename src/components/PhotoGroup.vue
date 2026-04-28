<template>
  <div class="photo-group" :class="{ cropped: isCropped, printed: isPrinted }">
    <div class="group-header" @click="expanded = !expanded">
      <div class="group-info">
        <div class="group-thumb">
          <img :src="group.rawImages[0]?.objectUrl" alt="" />
          <span v-if="isCropped" class="status-dot"></span>
        </div>
        <span class="group-label">{{ group.label }}</span>
        <span class="group-status" :class="{ done: isCropped, printed: isPrinted }">
          {{ isPrinted ? '已打印' : isCropped ? '已裁剪' : '待裁剪' }}
        </span>
      </div>
      <div class="group-actions">
        <button
          v-if="isCropped"
          class="btn-recrop"
          @click.stop="$emit('recrop')"
          title="重新裁剪"
        >重裁</button>
        <button class="btn-remove" @click.stop="$emit('remove')" title="删除">×</button>
      </div>
    </div>
    <div v-if="expanded" class="group-photos">
      <PhotoCard
        v-for="img in group.rawImages"
        :key="img.id"
        :image="img"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePhotoStore } from '../stores/photoStore'
import type { PhotoGroup as PhotoGroupType } from '../types'
import PhotoCard from './PhotoCard.vue'

const store = usePhotoStore()

const props = defineProps<{
  group: PhotoGroupType
}>()

defineEmits<{
  remove: []
  recrop: []
}>()

const isCropped = computed(() =>
  props.group.croppedPhotos.length > 0,
)

const isPrinted = computed(() => store.isPrinted(props.group.id))

const expanded = ref(!isCropped.value)
</script>

<style scoped>
.photo-group {
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #eee;
}
.photo-group.cropped {
  background: #f0f7f0;
  border-color: #c8e6c9;
}
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  cursor: pointer;
  user-select: none;
}
.group-header:hover {
  background: rgba(0, 0, 0, 0.03);
}
.group-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.group-thumb {
  position: relative;
  width: 28px;
  height: 39px;
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}
.group-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.status-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 7px;
  height: 7px;
  background: #4caf50;
  border-radius: 50%;
  border: 1.5px solid white;
}
.group-label {
  font-weight: 500;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.group-status {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
}
.group-status.done {
  color: #4caf50;
}
.group-status.printed {
  color: #1976d2;
}
.photo-group.printed {
  background: #e8f0fe;
  border-color: #bbdefb;
}
.photo-group.printed .status-dot {
  background: #1976d2;
}
.group-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.btn-recrop {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 11px;
  padding: 2px 6px;
  cursor: pointer;
  color: #666;
}
.btn-recrop:hover {
  background: #eee;
}
.btn-remove {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.btn-remove:hover {
  color: #e53935;
}
.group-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 10px 10px;
  flex-shrink: 0;
}
</style>
