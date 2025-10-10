import { defineStore } from 'pinia'
import Dexie from 'dexie'
import { ref } from 'vue'

const db = new Dexie('runflow-db')
db.version(1).stores({ gpxFiles: '++id,name,createdAt' })

const gpxFiles = ref([])

export const useGpxStore = defineStore('gpx', () => {

  async function loadGpxFiles() {
    gpxFiles.value = await db.gpxFiles.toArray()
    console.log("load gpx files", gpxFiles.value)
  }

  async function addGpxFile(name, content) {
    await db.gpxFiles.add({ name, content, createdAt: new Date().toISOString() })
    await loadGpxFiles()
  }

  loadGpxFiles()

  return { gpxFiles, addGpxFile }
})
