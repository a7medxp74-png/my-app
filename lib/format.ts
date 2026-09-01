export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}
export function formatMinutes(minutes: number) {
  return `${minutes} دقيقة`;
}
