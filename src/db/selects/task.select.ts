export const taskSelect = {
  id: true,
  iniciator_id: true,
  performer_id: true,
  begin_at: true,
  done_at: true,
  spent_time: true,
  deadline: true,
  status: true,
  performer: { select: { name: true } },
};
