<template>
  <div class="photo-card" @click="onClick">
    <div class="thumb">
      <img :src="image.objectUrl" alt="照片" />
      <div v-if="cropped" class="cropped-badge">已裁剪</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePhotoStore } from '../stores/photoStore'
import type { RawImage } from '../types'

const props = defineProps<{
  image: RawImage
}>()

const store = usePhotoStore()

const cropped = computed(() =>
  store.groups.some(g =>
    g.croppedPhotos.some(c => c.sourceImageId === props.image.id),
  ),
)

function onClick() {
  store.openCropModal(props.image.id)
}
</script>

<style scoped>
.photo-card {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  transition: border-color 0.2s;
  flex-shrink: 0;
}
.photo-card:hover {
  border-color: #4a90d9;
}
.thumb {
  position: relative;
  width: 60px;
  height: 84px;
  object-fit: cover;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cropped-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(76, 175, 80, 0.85);
  color: white;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
}
</style>
