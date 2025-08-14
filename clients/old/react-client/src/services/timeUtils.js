import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDateLabel(instantStr) {
    const date = new Date(instantStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dateOnly = format(date, "yyyy-MM-dd");
    const todayOnly = format(today, "yyyy-MM-dd");
    const yesterdayOnly = format(yesterday, "yyyy-MM-dd");

    if (dateOnly === todayOnly) return "Сегодня";
    if (dateOnly === yesterdayOnly) return "Вчера";
    return format(date, "d MMMM", { locale: ru });
}

export function formatTime(instantStr) {
    const localDate = new Date(instantStr);
    return format(localDate, "HH:mm");
}
