export const taskSelect = {
  id: true,
  iniciatorId: true,
  performerId: true,
  beginAt: true,
  doneAt: true,
  spentTime: true,
  deadline: true,
  status: true,
  performer: { select: { name: true } },
};
