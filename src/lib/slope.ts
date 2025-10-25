export const getSlopeColors = (slope: string) => {
  const absVal = Math.abs(Number(slope));
  let background = '';
  let color = '';
  if (absVal <= 5) {
    background = '#bbf7d0'; // vert pastel
    color = '#065f46';
  } else if (absVal <= 10) {
    background = '#fef08a'; // jaune pastel
    color = '#78350f';
  } else if (absVal <= 15) {
    background = '#fed7aa'; // orange pastel
    color = '#78350f';
  } else if (absVal <= 20) {
    background = '#fecaca'; // rouge pastel
    color = '#7f1d1d';
  } else {
    background = '#e0d7fd'; // violet pastel
    color = '#4c1d95';
  }

  return { background, color };
};
