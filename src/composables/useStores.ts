import { useInjection } from '@/lib/useInjection';
import { AppStores } from '@/stores/AppLoader';

export function useStores() {
  return useInjection<AppStores>('stores');
}
