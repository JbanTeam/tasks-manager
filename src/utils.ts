export const timeDifference = (beginAt: Date | null, doneAt: Date | null) => {
  if (!beginAt) throw new Error('Begin date is null.');
  if (!doneAt) throw new Error('Done date is null.');

  const diffInMillisec = Math.abs(doneAt.getTime() - beginAt.getTime());
  const seconds = Math.floor(diffInMillisec / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { days, hours, minutes, seconds, diffInMillisec };
};

export const convertMillisec = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { days, hours, minutes, seconds };
};
