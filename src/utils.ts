export const timeDifference = (beginAt: Date = new Date(), doneAt: Date = new Date()) => {
  const difference = Math.abs(doneAt.getTime() - beginAt.getTime());
  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { days, hours, minutes, seconds };
};
