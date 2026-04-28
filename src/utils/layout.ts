import type { PhotoGroup, CroppedPhoto, A4LayoutPage, LayoutResult } from '../types'
import {
  A4_HEIGHT_MM, MARGIN_TOP_MM, MARGIN_BOTTOM_MM,
  PHOTO_HEIGHT_MM, PHOTO_GAP_MM, PHOTOS_PER_ROW,
} from './constants'

export function calculateLayout(groups: PhotoGroup[]): LayoutResult {
  const pages: A4LayoutPage[] = []
  let currentY = MARGIN_TOP_MM
  let currentPage: A4LayoutPage = { pageNumber: 1, rows: [] }

  for (const group of groups) {
    if (group.croppedPhotos.length === 0) continue

    // 每人固定4张，刚好一行
    const rowHeight = PHOTO_HEIGHT_MM

    // 检查当前页是否能放下一行
    if (currentY + rowHeight > A4_HEIGHT_MM - MARGIN_BOTTOM_MM) {
      pages.push(currentPage)
      currentPage = { pageNumber: pages.length + 1, rows: [] }
      currentY = MARGIN_TOP_MM
    }

    // 取该组第一张裁剪结果，重复4次
    const photo = group.croppedPhotos[0]
    const photos: CroppedPhoto[] = Array.from({ length: PHOTOS_PER_ROW }, () => ({ ...photo }))

    currentPage.rows.push({
      groupId: group.id,
      photos,
    })

    currentY += rowHeight + PHOTO_GAP_MM
  }

  if (currentPage.rows.length > 0) {
    pages.push(currentPage)
  }

  return { pages, totalPages: pages.length }
}
