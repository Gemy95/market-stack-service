export const getTtlUntilEndOfDay = (): number => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const ttlMs = endOfDay.getTime() - now.getTime();
  return Math.floor(ttlMs / 1000);
};
