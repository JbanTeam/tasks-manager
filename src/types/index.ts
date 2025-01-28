import { Prisma, TaskStatus } from '@prisma/client';

export interface DecodedUser {
  userId: number;
  email: string;
}

export type ProjectType = Prisma.ProjectGetPayload<{
  select: {
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
