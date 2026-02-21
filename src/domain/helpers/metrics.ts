import { METRICS } from '@/domain/constants/metrics';
import {
  Metric,
  MetricType,
  MetricUnit,
  MetricValue,
} from '@/domain/types/Metric';

export function createDefaultMetricValue(): MetricValue {
  return {
    metric: getMetric('duration'),
    value: 0,
    unit: getMetricUnits(getMetric('duration'))[0],
  };
}

export const getMetric = (type: MetricType): Metric => {
  return METRICS.find((el) => el.type === type);
};

export const getMetricUnits = (metric: Metric): MetricUnit[] => {
  if (!metric) return [];
  if (metric.type === 'distance') return ['m', 'km'];
  if (metric.type === 'duration') return ['s', 'min'];
};
