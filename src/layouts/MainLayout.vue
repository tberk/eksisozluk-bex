<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated style="background-color: #2D2D2D">
      <q-toolbar>
        <q-toolbar-title shrink style="color: #81C14B">
          ek$isözlük entry silici
        </q-toolbar-title>

        <q-space />

        <div>v1.0.0</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout'
}
</script>
