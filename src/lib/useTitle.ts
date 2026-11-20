import { useEffect } from 'react'
import { SHOP } from '../config'
import { useI18n } from '../i18n'

export function useTitle(title?: string) {
  const { t } = useI18n()
  useEffect(() => {
    document.title = title ? `${title} | ${SHOP.name}` : t.meta.title
  }, [title, t])
}
