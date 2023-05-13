import { storage } from 'webextension-polyfill'
import { useStorageLocal } from '~/composables/useStorageLocal'

const arr: number[] = []

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

// Test
// console.log(Array.isArray(entries.value))
