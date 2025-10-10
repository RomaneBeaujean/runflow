import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'

export const useRaceStore = defineStore('race', () => {
  const races = useLocalStorage('runflow-races', [])

  function addRace(name) {
    const race = {
      id: nanoid(),
      name,
      createdAt: new Date().toISOString(),
      segments: []
    }
    races.value.push(race)
    return race
  }

  return { races, addRace }
})
