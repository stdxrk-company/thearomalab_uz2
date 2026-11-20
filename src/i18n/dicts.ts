import { en } from './en'
import type { Lang } from './lang'
import { ru, type Dict } from './ru'
import { uz } from './uz'

export type { Dict }

export const DICTS: Record<Lang, Dict> = { ru, uz, en }
