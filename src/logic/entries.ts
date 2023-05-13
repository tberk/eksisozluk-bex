import { storage } from 'webextension-polyfill'
import { useStorageLocal } from '~/composables/useStorageLocal'

const arr: number[] = []

// array for entries to be deleted
export const entries = useStorageLocal('entries', JSON.stringify(arr))

export const getList = async (): Promise<number[]> => {
  const list = (await storage.local.get('entries')).entries

  return JSON.parse(list)
}

export const saveList = (arr: number[]) => {
  entries.value = JSON.stringify(arr)
}

export const removeEntry = async (id: number) => {
  let list = await getList()

  list = list.filter(item => item !== id)

  saveList(list)
}

export const addEntry = async (id: number) => {
  const list = await getList()

  if (!id || list.includes(id))
    return

  list.push(id)

  saveList(list)
}

// array for entries that are deleted
export const deletedEntries = useStorageLocal('deletedEntries', JSON.stringify(arr))

export const getDeletedEntries = async (): Promise<number[]> => {
  const list = (await storage.local.get('deletedEntries')).deletedEntries

  return JSON.parse(list)
}

export const saveDeletedEntries = (arr: number[]) => {
  deletedEntries.value = JSON.stringify(arr)
}

export const addDeletedEntry = async (id: number) => {
  const list = await getDeletedEntries()

  if (!id || list.includes(id))
    return

  list.push(id)

  saveDeletedEntries(list)
}

// Test
// console.log(Array.isArray(entries.value))
