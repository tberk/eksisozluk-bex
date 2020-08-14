<template>
  <q-page class="flex flex-center">
    <div class="row q-gutter-x-sm" style="width: 500px">

      <q-card
        class="my-card text-white full-width"
        style="background: radial-gradient(circle, #35a2ff 0%, #014a88 100%)"
      >
        <q-card-section>
          <div class="row items-center">
            <div class="text-h6">silinecek entryler</div>
            <q-space />
            <q-btn color="white" text-color="dark" no-caps dense class="q-px-sm" v-if="entries.length > 0" @click="onClearList">listeyi temizle</q-btn>
          </div>

        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-chip v-for="(entry, index) in entries" :key="index" clickable @click="openEntry(entry)">#{{ entry }}</q-chip>

          <template v-if="entries.length === 0">
            liste boş
          </template>
        </q-card-section>
      </q-card>

      <!-- Deleted -->
      <q-card
        class="my-card text-white full-width bg-red-10 q-mt-lg"
      >
        <q-card-section>
          <div class="text-h6">silinen entryler</div>
        </q-card-section>

        <q-card-section class="q-pt-none scroll" style="max-height: 320px">
          <q-chip v-for="(entry, index) in deleted" :key="index" clickable @click="openEntry(entry)" v-if="entry">#{{ entry }}</q-chip>

          <template v-if="deleted.length === 0">
            liste boş
          </template>
        </q-card-section>
      </q-card>



    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      entries: [],
      deleted: []
    }
  },
  created() {
    //
    this.onListsUpdated()

    //
    this.$q.bex.on('update.ui', event => {
      this.onListsUpdated()
      this.$q.bex.send(event.eventResponseKey)
    })
  },
  methods: {
    onListsUpdated () {
      console.log('updating ui')
      this.$q.bex.send('storage.get', { key: 'list.entries' }).then(response => {
        if (response.data)
          this.entries = response.data

        console.log(this.entries)
      })
      this.$q.bex.send('storage.get', { key: 'list.deleted' }).then(response => {
        if (response.data)
          this.deleted = response.data.reverse()
      })
    },
    openEntry (id) {
      window.open('https://eksisozluk.com/entry/' + id, '_blank');
    },
    onClearList () {
      this.$q.bex.send('storage.remove', { key: 'list.entries' }).then(response => {
        console.log('List saved successfully. Response: ', response.data)
        this.$q.notify({
          message: 'Liste temizlendi.',
          position: 'top',
          color: 'green'
        })
      });
    }
  }
}
</script>
