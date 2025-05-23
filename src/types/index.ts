import { Prisma, TaskStatus } from '@prisma/client';

export type ProjectType = Prisma.ProjectGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    authorId: true;
    tasks: {
      select: {
        id: true;
        iniciatorId: true;
        performerId: true;
        beginAt: true;
        doneAt: true;
        spentTime: true;
        status: true;
      };
    };
    users: { select: { id: true } };
  };
}>;

export type TaskType = Prisma.TaskGetPayload<{
  select: { iniciatorId: true; performerId: true; beginAt: true; doneAt: true; spentTime: true; status: true };
}>;

export type TaskUpdateData = {
  status: TaskStatus;
  beginAt?: Date;
  doneAt?: Date;
  spentTime?: number;
};
