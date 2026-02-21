import {
  createTrainingPlanWeeks,
  createTrainingPlan as factory,
} from '@/domain/factories/TrainingPlanFactory';
import { TrainingPlan } from '@/domain/types/TrainingPlan';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStores } from './useStores';

export function useTrainingPlans() {
  const stores = useStores();
  const router = useRouter();

  const allTrainingPlans = computed(() => {
    return stores.training_plans_store.training_plans;
  });

  const isTrainingPlanNameExist = (initial: string, value: string) => {
    const allNames = allTrainingPlans.value
      .map((tp) => tp.name)
      .filter((n) => n !== initial);
    return allNames.includes(value);
  };

  const createTrainingPlan = async (
    trainingPlan: Partial<TrainingPlan>,
    numberOfWeeks: number
  ): Promise<string> => {
    const weeks = createTrainingPlanWeeks(numberOfWeeks);
    const newTrainingPlan = factory({ ...trainingPlan, weeks });
    const id = await stores.training_plans_store.create(newTrainingPlan);
    return id;
  };

  function navigateToTrainingPlan(id: string) {
    router.push(`/trainings/${id}`);
  }

  return {
    allTrainingPlans,
    isTrainingPlanNameExist,
    createTrainingPlan,
    navigateToTrainingPlan,
  };
}
