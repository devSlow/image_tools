export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return loadImage(url).then(img => ({
    width: img.naturalWidth,
    height: img.naturalHeight,
  }))
}

export function cropAndResize(
  img: HTMLImageElement,
  region: { x: number; y: number; width: number; height: number },
  targetWidth: number,
  targetHeight: number,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    img,
    region.x, region.y, region.width, region.height,
    0, 0, targetWidth, targetHeight,
  )
  return canvas.toDataURL('image/jpeg', 0.95)
}
