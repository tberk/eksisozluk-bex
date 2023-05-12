import { storage } from 'webextension-polyfill'
import { useStorageLocal } from '~/composables/useStorageLocal'

const arr: number[] = []

export const entries = useStorageLocal('entries', JSON.stringify(arr))

export const getList = async () => {
  const list = (await storage.local.get('entries')).entries

  return JSON.parse(list)
}

export const saveList = async (arr: Array) => {
  entries.value = JSON.stringify(arr)
}

// Test
// console.log(Array.isArray(entries.value))
