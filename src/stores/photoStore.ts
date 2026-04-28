import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PhotoGroup, CroppedPhoto, LayoutResult } from '../types'
import { calculateLayout } from '../utils/layout'

export const usePhotoStore = defineStore('photo', () => {
  const groups = ref<PhotoGroup[]>([])
  const activeCropImageId = ref<string | null>(null)
  const cropModalVisible = ref(false)
  const printedGroupIds = ref<Set<string>>(new Set())
  let groupCounter = 0

  const allCropped = computed(() =>
    groups.value.length > 0 && groups.value.every(
      g => g.croppedPhotos.length > 0,
    ),
  )

  const layoutResult = computed<LayoutResult | null>(() => {
    const validGroups = groups.value.filter(g => g.croppedPhotos.length > 0)
    if (validGroups.length === 0) return null
    return calculateLayout(validGroups)
  })

  function addGroup(rawImages: PhotoGroup) {
    groupCounter++
    rawImages.label = `人物 ${groupCounter}`
    groups.value = [...groups.value, rawImages]
  }

  function setCroppedPhoto(rawImageId: string, cropped: CroppedPhoto) {
    groups.value = groups.value.map(g => {
      const img = g.rawImages.find(r => r.id === rawImageId)
      if (!img) return g

      const idx = g.croppedPhotos.findIndex(c => c.sourceImageId === rawImageId)
      const newCropped = idx >= 0
        ? g.croppedPhotos.map((c, i) => i === idx ? cropped : c)
        : [...g.croppedPhotos, cropped]

      return { ...g, croppedPhotos: newCropped }
    })
  }

  function removeGroup(groupId: string) {
    groups.value = groups.value.filter(g => g.id !== groupId)
  }

  function openCropModal(imageId: string) {
    activeCropImageId.value = imageId
    cropModalVisible.value = true
  }

  function closeCropModal() {
    activeCropImageId.value = null
    cropModalVisible.value = false
  }

  function markPrinted(groupIds: string[]) {
    printedGroupIds.value = new Set([...printedGroupIds.value, ...groupIds])
  }

  function isPrinted(groupId: string): boolean {
    return printedGroupIds.value.has(groupId)
  }

  return {
    groups,
    activeCropImageId,
    cropModalVisible,
    layoutResult,
    allCropped,
    printedGroupIds,
    addGroup,
    setCroppedPhoto,
    removeGroup,
    openCropModal,
    closeCropModal,
    markPrinted,
    isPrinted,
  }
})
