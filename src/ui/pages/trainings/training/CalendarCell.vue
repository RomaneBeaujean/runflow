<template>
  <td :class="{ 'out-month': day == null }">
    <div
      :class="[
        'day-cell',
        isToday() ? 'today' : '',
        isActive() ? 'active' : '',
      ]"
    >
      <div class="planned-trainings">
        <!-- Tags -->
      </div>
      <div class="day-number">{{ day }}</div>
      <div class="action-menu-holder" @click="setActiveDay">
        <!-- <swm-action-menu :id="`${day}-action-menu`" placement="right,left,bottom,top">
          <swm-menu :id="`${day}-menu`">
            <swm-menu-item value="add-training" @click="openAddTrainingModal">
              <swm-icon :key="`${day}-add-training-icon`" slot="left" name="watch-fitness" />
              <span slot="label">Ajouter un entrainement</span>
            </swm-menu-item>
            <swm-menu-item value="add-race">
              <swm-icon :key="`${day}-add-race-icon`" slot="left" name="person-running" />
              <span slot="label">Ajouter une compétition</span>
            </swm-menu-item>
            <swm-menu-item value="add-note">
              <swm-icon :key="`${day}-add-note-icon`" slot="left" name="note" />
              <span slot="label">Ajouter une note</span>
            </swm-menu-item>
            <swm-menu-item value="add-cycle">
              <swm-icon :key="`${day}-add-cycle-icon`" slot="left" name="arrows-spin" />
              <span slot="label">Ajouter un cycle</span>
            </swm-menu-item>
          </swm-menu>
        </swm-action-menu> -->
      </div>
    </div>
  </td>
</template>

<script setup lang="ts">
import { CalendarService } from '@/domain/Calendar.service';
import { useTrainingPlan } from '@/ui/composables/useTrainingPlan';

const { activeDay } = useTrainingPlan();

const props = defineProps<{
  year: number;
  month: number;
  day: number;
}>();

const calendarService = new CalendarService();

const openAddTrainingModal = () => {
  // stores.global.update("trainingModalOpened", true);
};

const unsetActiveDay = () => {
  // stores.calendar.activeDay = null;
};

const setActiveDay = () => {
  // stores.calendar.activeDay = props.day;
};

const isActive = () => {
  return props.day === activeDay.value;
};

const isTrainingActive = (id: string) => {
  // return stores.global.get("trainingDetailsOpenedId") == id;
};

const isToday = () => {
  return (
    props.day !== null &&
    calendarService.isToday(props.year, props.month, props.day)
  );
};
</script>

<style scoped lang="scss">
td.out-month .day-cell {
  background-color: var(--color-gray-200);
}

.day-cell {
  min-width: 25px;
  height: 150px;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 8px;
  color: var(--color-primary-600);
  box-sizing: border-box;

  &.today .day-number {
    color: white;
    background: var(--color-primary-600);
    border-radius: 20%;
    font-size: 12px;
    font-weight: 600;
  }

  .day-number {
    position: absolute;
    padding: 4px;
    top: 0;
    right: 0;
    font-size: 12px;
    font-weight: 500;
  }

  &.active {
    background-color: var(--color-primary-200);
  }

  &:hover {
    background-color: var(--color-primary-100);
    cursor: pointer;
  }

  .action-menu-holder {
    width: 100%;
    height: 100%;
  }
}
</style>
