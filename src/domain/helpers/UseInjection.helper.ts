import { inject } from 'vue';

export function useInjection<T>(key: string): T {
  const injectedValue = inject<T>(key);

  if (!injectedValue) {
    throw new Error(
      `Injection for key "${key}" failed. Ensure it is provided.`
    );
  }

  return injectedValue;
}
