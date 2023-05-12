<script setup lang="ts">
import { entries, saveList } from '~/logic/entries'

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

function clearList() {
  saveList([])
}

const entryList = computed(() => JSON.parse(entries.value))
</script>

<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <img src="/assets/icon-512.png" class="h-12 mx-auto mb-1">
    <div class="">
      ekşi sözlük entry silici
    </div>
    <div class="mt-1 text-gray-400">
      {{ entryList.length === 0 ? 'liste boş' : `${entryList.length} entry silme listesinde` }}
    </div>

    <button v-if="entryList.length > 0" class="btn mt-2" @click="clearList">
      listeyi temizle
    </button>

    {{ entryList }}

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
