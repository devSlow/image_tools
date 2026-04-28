export interface RawImage {
  id: string
  file: File
  objectUrl: string
  naturalWidth: number
  naturalHeight: number
  groupId: string
}

export interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}

export interface CroppedPhoto {
  id: string
  sourceImageId: string
  dataUrl: string
  widthPx: number
  heightPx: number
}

export interface PhotoGroup {
  id: string
  label: string
  rawImages: RawImage[]
  croppedPhotos: CroppedPhoto[]
}

export interface A4Row {
  groupId: string
  photos: CroppedPhoto[]
}

export interface A4LayoutPage {
  pageNumber: number
  rows: A4Row[]
}

export interface LayoutResult {
  pages: A4LayoutPage[]
  totalPages: number
}
