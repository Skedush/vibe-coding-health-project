import type { Entry } from '@/types/api'

export interface CollectionItem {
  title: string
  checkList: Entry[]
}

export function processTreeStructure(entrys: Entry[]): CollectionItem[] {
  const grouped: Record<string, CollectionItem> = {}

  entrys.forEach((item) => {
    const [groupTitle, entryTitle] = item.title.split('|', 2)
    const processedItem = { ...item, title: entryTitle || item.title }

    if (!grouped[groupTitle]) {
      grouped[groupTitle] = { title: groupTitle, checkList: [] }
    }
    grouped[groupTitle].checkList.push(processedItem)
  })

  return Object.values(grouped)
}