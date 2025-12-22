export class TrainingPlan {
  id: string = null;
  name: string = null;
  createdAt: string = null;
  training_weeks: TrainingWeek[] = [];
  startDate: Date | null = null;

  constructor(data?: Partial<TrainingPlan>) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });

    if (this.training_weeks.length === 0) {
      this.training_weeks.push(new TrainingWeek({ week_number: 1 }));
    }
  }
}

export class TrainingWeek {
  week_number: number = null;
  training_days: TrainingDay[] = [];

  constructor(data?: Partial<TrainingWeek>) {
    Object.keys(data).forEach((obj) => (this[obj] = data[obj]));

    if (this.training_days.length < 7) {
      for (let i = this.training_days.length + 1; i <= 7; i++) {
        this.training_days.push(new TrainingDay({ day_number: i }));
      }
    }
  }
}

export class TrainingDay {
  day_number: number = null;
  training: string = null;

  constructor(data?: Partial<TrainingDay>) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}
