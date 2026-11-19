import { useEffect } from 'react'
import { SHOP } from '../config'

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SHOP.name}` : `${SHOP.name} — оригинальная парфюмерия в распив | Ташкент`
  }, [title])
}
