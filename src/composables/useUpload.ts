import { usePhotoStore } from '../stores/photoStore'
import { getImageDimensions } from '../utils/image'
import type { RawImage, PhotoGroup } from '../types'

let groupCounter = 0

export function useUpload() {
  const store = usePhotoStore()

  async function handleFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    // 每张图片独立为一个人物分组
    for (const file of imageFiles) {
      const objectUrl = URL.createObjectURL(file)
      try {
        const dims = await getImageDimensions(objectUrl)
        groupCounter++
        const groupId = `group-${Date.now()}-${groupCounter}`
        const rawImage: RawImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          objectUrl,
          naturalWidth: dims.width,
          naturalHeight: dims.height,
          groupId,
        }

        const group: PhotoGroup = {
          id: groupId,
          label: '',
          rawImages: [rawImage],
          croppedPhotos: [],
        }

        store.addGroup(group)
      } catch {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }

  return { handleFiles }
}
