<template>
  <div class="table-holder">
    <table>
      <thead>
        <tr>
          <th v-for="day in calendarService.daysOrdered" :key="day">
            <div class="header-cell">{{ day }}.</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(week, index) in calendarService.getWeeks(year, month)"
          :key="index"
        >
          <CalendarCell
            v-for="(day, dayIndex) in week"
            :key="'td-' + day + dayIndex"
            :day="day"
            :year="year"
            :month="month"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { CalendarService } from '@/domain/services/Calendar.service';
import { ref } from 'vue';
import CalendarCell from './CalendarCell.vue';

const calendarService = ref(new CalendarService());
const year = ref(calendarService.value.currentYear);
const month = ref(calendarService.value.currentMonth);
</script>

<style scoped lang="scss">
.table-holder {
  padding: 16px;
  overflow: hidden;

  table {
    width: 100%;
    box-sizing: border-box;
    table-layout: fixed;
    border-collapse: collapse;
    background-color: white;
    border-radius: 8px;
  }

  th,
  td {
    border: 1px solid var(--color-gray-300);
  }

  .header-cell {
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
