import request from './request'

export interface EntryInfo {
  id: number
  user_id: number
  category_id: number
  title_id: number
  created: string
  updated: string
  is_delete: boolean
}

export interface UserEntry {
  id: number
  entry_info_id: number
  name: string
  gender: string
  height: string | null
  weight: string | null
  age: string | null
  address: string | null
  waistline: string | null
  systolic_pressure: string | null
  diastolic_pressure: string | null
  blood_sugar: string | null
  remark: string | null
  suggestion: string | null
  phone: string | null
  created: string
  updated: string
  is_delete: boolean
}

export const getEntryInfos = () =>
  request.get<EntryInfo[]>('/entryInfo/')

export const createEntryInfo = (data: Partial<EntryInfo>) =>
  request.post('/entryInfo/', data)

export const getUserEntries = () =>
  request.get<UserEntry[]>('/userEntry/')

export const createUserEntry = (data: Partial<UserEntry>) =>
  request.post('/userEntry/', data)

export const updateUserEntry = (id: number, data: Partial<UserEntry>) =>
  request.patch(`/userEntry/${id}/`, data)

export const deleteUserEntry = (id: number) =>
  request.delete(`/userEntry/${id}/`)
