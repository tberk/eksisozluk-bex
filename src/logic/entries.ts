import { useStorageLocal } from '~/composables/useStorageLocal'

const arr: number[] = []

export const entries = useStorageLocal('entries', arr)
