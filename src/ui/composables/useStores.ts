import { useInjection } from '@/domain/helpers/use-injection';
import { AppStores } from '@/infrastructure/stores/AppLoader';

export function useStores() {
  return useInjection<AppStores>('stores');
}
