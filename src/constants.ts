export const port = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'my-secret-key';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'my-secret-key';

export const ProjectTimeFilter = {
  WEEK: 'week',
  MONTH: 'month',
  HOUR: 'hour',
};
