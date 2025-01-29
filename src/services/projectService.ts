import { TaskType } from '../types';
import { timeDifference } from '../utils/time';
import { ProjectTimeFilter } from '../constants';
import { TaskStatus } from '@prisma/client';

const calculateProjectTime = (tasks: TaskType[], filterTime?: string) => {
  const { now, filterDate } = assignFilterDate(filterTime);

  const totalMs = tasks.reduce((acc: number, task: TaskType) => {
    if (!task.beginAt) return acc;
    const taskBeginAt = new Date(task.beginAt);
    const taskDoneAt = task.doneAt ? new Date(task.doneAt) : now;

    if (filterDate) {
      const effectiveStart = taskBeginAt > filterDate ? taskBeginAt : filterDate;

      if (effectiveStart >= taskDoneAt) return acc;

      const { ms } = timeDifference(effectiveStart, taskDoneAt);

      acc += ms;
    } else {
      if (task.status === TaskStatus.IN_PROGRESS) {
        const { ms } = timeDifference(task.beginAt, now);
        acc += ms;
      } else if (task.status === TaskStatus.DONE) {
        acc += Number(task.spentTime);
      }
    }

    return acc;
  }, 0);

  return totalMs;
};

const assignFilterDate = (filterTime?: string) => {
  const now = new Date();
  let filterDate: Date | null = new Date();

  switch (filterTime) {
    case ProjectTimeFilter.WEEK:
      filterDate.setDate(now.getDate() - 7);
      break;
    case ProjectTimeFilter.MONTH:
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case ProjectTimeFilter.HOUR:
      filterDate.setHours(now.getHours() - 24);
      break;
    default:
      filterDate = null;
      break;
  }
  return { now, filterDate };
};

export { calculateProjectTime };
