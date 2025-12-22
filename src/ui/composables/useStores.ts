import { useInjection } from '@/domain/helpers/UseInjection.helper';
import { AppStores } from '@/infrastructure/stores/AppLoader';

export function useStores() {
  return useInjection<AppStores>('stores');
}
