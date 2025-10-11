<template>
  <swm-card>
    <swm-card-body>
      <swm-table editableonhover v-if="race">
        <table>
          <thead>
            <tr>
              <th>
                <swm-table-header>
                  <span slot="title">Début split</span>
                </swm-table-header>
              </th>
              <th>
                <swm-table-header>
                  <span slot="title">Fin split</span>
                </swm-table-header>
              </th>
              <th>
                <swm-table-header>
                  <swm-icon slot="left" name="arrows-left-right"></swm-icon>
                  <span slot="title">Distance split</span>
                </swm-table-header>
              </th>
              <th>
                <swm-table-header>
                  <swm-icon slot="left" name="chart-line"></swm-icon>
                  <span slot="title">D+ split</span>
                </swm-table-header>
              </th>
              <th>
                <swm-table-header>
                  <swm-icon slot="left" name="chart-line"></swm-icon>
                  <span slot="title">D+ total</span>
                </swm-table-header>
              </th>
              <th>
                <swm-table-header>
                  <span slot="title">Allure split</span>
                  <span slot="subtitle">(min/km)</span>
                </swm-table-header>
              </th>
              <th>
                <swm-table-header>
                  <span slot="title">Durée split</span>
                  <span slot="subtitle">(heures)</span>
                </swm-table-header>
              </th>
              <th>
                <swm-table-header>
                  <span slot="title">Temps total écoulé</span>
                  <span slot="subtitle">(heures)</span>
                </swm-table-header>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <RaceTableRow
              v-for="(split, index) in splits"
              :split="split"
              :key="split.startDistance + split.endDistance + split.pace"
            />
          </tbody>
        </table>
      </swm-table>
    </swm-card-body>
  </swm-card>
  <swm-button class="swm-margin-top-100">
    <button type="button">
      <swm-icon slot="left" name="plus"></swm-icon>
      <span slot="label">Ajouter un séparateur</span>
    </button>
  </swm-button>
</template>

<script setup lang="ts">
import { useRace } from '@/composables/useRace';
import RaceTableRow from './RaceTableRow.vue';

const { race, splits } = useRace();
</script>

<style lang="scss" scoped></style>
