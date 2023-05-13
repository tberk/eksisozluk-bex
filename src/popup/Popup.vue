<script setup lang="ts">
import { useIntervalFn, useToggle } from '@vueuse/core'
import { getDeletedEntries, getList, saveList } from '~/logic/entries'

const list: Ref<number[]> = ref([])
const listDeleted: Ref<number[]> = ref([])
const [showDeletedList, toggleDeletedList] = useToggle()
const [showList, toggleList] = useToggle()

onMounted(async () => {
  syncList()

  // Update list once in while
  useIntervalFn(() => syncList(), 3 * 1000)
})

async function syncList() {
  list.value = await getList()
  listDeleted.value = await getDeletedEntries()
}

function clearList() {
  saveList([])
}

/* function openOptionsPage() {
  browser.runtime.openOptionsPage()
} */
</script>

<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <img src="/assets/icon-512.png" class="h-12 mx-auto mb-1">
    <div class="">
      ekşi sözlük entry silici
    </div>
    <div class="mt-1 text-gray-400">
      <div v-if="list.length === 0">
        liste boş
      </div>
      <button v-else @click="toggleList()">
        {{ `${list.length} entry silme listesinde` }}
      </button>
    </div>

    <template v-if="list.length > 0 && showList">
      <div class="grid grid-cols-3 max-h-[120px] overflow-y-auto mt-2 bg-green-50 rounded">
        <div v-for="e in list" :key="e" class="hover:bg-gray-100 p-1 rounded">
          <a :href="`https://eksisozluk2023.com/entry/${e}`" target="_blank">#{{ e }}</a>
        </div>
      </div>

      <button class="btn mt-2 flex items-center gap-2 mx-auto" @click="clearList">
        <mdi:delete-sweep-outline /> listeyi temizle
      </button>
    </template>

    <template v-if="listDeleted.length > 0">
      <div class="mt-1 text-red-400 cursor-pointer" @click="toggleDeletedList()">
        şimdiye kadar {{ listDeleted.length }} entry silindi.
      </div>

      <div v-if="showDeletedList" class="grid grid-cols-3 max-h-[120px] overflow-y-auto mt-2 bg-red-100 rounded">
        <a v-for="e in listDeleted" :key="e" :href="`https://eksisozluk2023.com/entry/${e}`" target="_blank" class="hover:bg-gray-100 py-1 px-1 rounded">
          #{{ e }}
        </a>
      </div>
    </template>

    <!--
    <button class="btn mt-2" @click="openOptionsPage">
      Open Options
    </button>
    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>
    -->
  </main>
</template>
