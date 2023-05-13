<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { getList, saveList } from '~/logic/entries'

const list: Ref<number[]> = ref([])

onMounted(async () => {
  syncList()

  // Update list once in while
  useIntervalFn(() => syncList(), 3 * 1000)
})

async function syncList() {
  list.value = await getList()
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
      {{ list.length === 0 ? 'liste boş' : `${list.length} entry silme listesinde` }}
    </div>

    <template v-if="list.length > 0">
      <button class="btn btn-warning mt-2 flex items-center gap-2 mx-auto" @click="clearList">
        <mdi:delete-sweep-outline /> listeyi temizle
      </button>

      <div class="grid grid-cols-3 max-h-[120px] overflow-y-auto mt-2">
        <div v-for="e in list" :key="e" class="hover:bg-gray-100 p-1 rounded">
          <a :href="`https://eksisozluk2023.com/entry/${e}`" target="_blank">#{{ e }}</a>
        </div>
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
