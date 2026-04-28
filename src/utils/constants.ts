// 2寸照片标准尺寸（毫米）
export const PHOTO_WIDTH_MM = 35
export const PHOTO_HEIGHT_MM = 49

// 裁剪宽高比
export const CROP_ASPECT_RATIO = PHOTO_WIDTH_MM / PHOTO_HEIGHT_MM

// A4纸尺寸（毫米）
export const A4_WIDTH_MM = 210
export const A4_HEIGHT_MM = 297

// A4纸像素尺寸（96 DPI）
export const A4_WIDTH_PX = 794
export const A4_HEIGHT_PX = 1123

// 打印边距（毫米）
export const MARGIN_TOP_MM = 5
export const MARGIN_BOTTOM_MM = 5
export const MARGIN_LEFT_MM = 5
export const MARGIN_RIGHT_MM = 5

// 照片间距（毫米）——裁剪线区域宽度
export const PHOTO_GAP_MM = 2

// 每行照片数
export const PHOTOS_PER_ROW = 4

// 打印 DPI
export const PRINT_DPI = 300

// 300DPI 下的像素尺寸
export const PHOTO_WIDTH_300DPI = Math.round(PHOTO_WIDTH_MM / 25.4 * PRINT_DPI)   // 413
export const PHOTO_HEIGHT_300DPI = Math.round(PHOTO_HEIGHT_MM / 25.4 * PRINT_DPI)  // 578
export const A4_WIDTH_300DPI = Math.round(A4_WIDTH_MM / 25.4 * PRINT_DPI)          // 2480
export const A4_HEIGHT_300DPI = Math.round(A4_HEIGHT_MM / 25.4 * PRINT_DPI)        // 3508
