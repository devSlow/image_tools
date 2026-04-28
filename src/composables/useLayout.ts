import { usePhotoStore } from '../stores/photoStore'

export function useLayout() {
  const store = usePhotoStore()
  return { layoutResult: store.layoutResult }
}
