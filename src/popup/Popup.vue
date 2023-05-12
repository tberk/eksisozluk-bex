<script setup lang="ts">
import { storageDemo } from '~/logic/storage'
import { entries } from '~/logic/entries'

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}
</script>

<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <img src="/assets/icon-512.png" class="h-12 mx-auto mb-1">
    <div>ekşi sözlük entry silici</div>
    <div>
      list status vs
    </div>

    <button class="btn mt-2" @click="openOptionsPage">
      Open Options
    </button>
    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>
    <div>
      entries: {{ entries }}
    </div>
  </main>
</template>
