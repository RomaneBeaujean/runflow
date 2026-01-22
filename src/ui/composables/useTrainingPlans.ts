import { computed } from "vue";
import { useRouter } from "vue-router";
import { useStores } from "./useStores";


export function useTrainingPlans() {
  const stores = useStores();
  const router = useRouter();

  const allTrainingPlans = computed(() => {
    return stores.training_plans_store.training_plans;
  });
  
  const isTrainingPlanNameExist = (value: string) => {
    const allNames = allTrainingPlans.value.map((tp) => tp.name);
    return allNames.includes(value);
  }

  const createTrainingPlan = async (name: string): Promise<string> => {
    if (!name) return;

    const id = await stores.training_plans_store.create({
      name: name,
    });

    return id;
  }

  function navigateToTrainingPlan(id: string) {
  router.push(`/trainings/${id}`);
}

  return {
    allTrainingPlans,
    isTrainingPlanNameExist,
    createTrainingPlan,
    navigateToTrainingPlan
  }
}