export interface Metric {
  type: MetricType;
  label: string;
  icon: string;
}

export interface MetricValue {
  metric: Metric;
  value: number;
  unit: MetricUnit;
}

export type MetricType = 'distance' | 'duration';

export type MetricUnit = 'km' | 'm' | 'min' | 's';
