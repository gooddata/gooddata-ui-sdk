// (C) 2007-2026 GoodData Corporation

export function getTime(): number {
    return Date.now();
}

export function getDuration(startTime: number): number {
    return Date.now() - startTime;
}

// do not use toISOString or UTC based methods here
// because they could shift date +-day and send different date then was chosen
export function getIsoDate(date: Date) {
    return [
        date.getFullYear(),
        (date.getMonth() + 1).toString().padStart(2, "0"),
        date.getDate().toString().padStart(2, "0"),
    ].join("-");
}
