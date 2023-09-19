export const getSecondsElapsed = (startTime: Date) : number => {
  const timeNow = new Date();
  return Math.round((timeNow.getTime() - startTime.getTime()) / 1000);
}