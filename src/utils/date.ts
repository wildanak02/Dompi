// src/utils/date.ts
export function toISODateString(date: string | Date){
    if(typeof date === 'string') return date;
    return new Date(date).toISOString();
}
