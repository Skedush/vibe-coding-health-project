import { useUserEntryList } from '@/api/request'

export const useEntryList = (
  entryInfoId: string,
  search?: string
) => {
  return useUserEntryList({
    entry_info: entryInfoId ? Number(entryInfoId) : undefined,
    search,
  })
}
