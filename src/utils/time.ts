export const timeDifference = (beginAt: Date | null, doneAt: Date | null) => {
  if (!beginAt) throw new Error('Begin date is null.');
  if (!doneAt) throw new Error('Done date is null.');

  const ms = Math.abs(doneAt.getTime() - beginAt.getTime());
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { days, hours, minutes, seconds, ms };
};

export const convertMilliseconds = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return { days, hours, minutes, seconds };
};

export const formatMilliseconds = (ms: number) => {
  const msInMinute = 1000 * 60;
  const msInHour = msInMinute * 60;
  const msInDay = msInHour * 24;

  const days = Math.floor(ms / msInDay);
  const hours = Math.floor((ms % msInDay) / msInHour);
  const minutes = Math.floor((ms % msInHour) / msInMinute);

  return {
    days,
    hours,
    minutes,
  };
};
