export const getTtlUntilEndOfDay = (): number => {
  const now = new Date();

  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return endOfDay.getTime() - now.getTime();
};
