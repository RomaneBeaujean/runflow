export class CalendarService {
  daysValue: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  daysOrdered: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  get currentDate(): Date {
    return new Date();
  }

  get currentDay(): number {
    return this.currentDate.getDay();
  }

  get currentMonth(): number {
    return this.currentDate.getMonth();
  }

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  isToday(year: number, month: number, day: number | null = null) {
    if (!day) return false;
    const date = new Date(year, month, day).toDateString();
    const isToday = date == this.currentDate.toDateString();
    return isToday;
  }

  getDayString(year: number, month: number, day: number) {
    const dayNumber = new Date(year, month, day).getDay();
    return this.daysValue[dayNumber];
  }

  getDayIndex(day: string) {
    return this.daysOrdered.findIndex((el: string) => el === day);
  }

  getMonthName(year: number, month: number) {
    return new Date(year, month).toLocaleString('default', { month: 'long' });
  }

  getWeeks(year: number, month: number): CalendarWeek[] {
    const weeks: CalendarWeek[] = [];
    const lastDay = new Date(year, month + 1, 0).getDate();
    let weekIndex = 0;

    for (let day = 1; day <= lastDay; day++) {
      const dayIndex = this.getDayIndex(this.getDayString(year, month, day));
      if (weeks[weekIndex] == null) {
        weeks.push(new Array(7).fill(null));
      }
      weeks[weekIndex][dayIndex] = day;

      if (dayIndex === 6) {
        weekIndex += 1;
      }
    }
    return weeks;
  }
}

export type CalendarWeek = number[];
