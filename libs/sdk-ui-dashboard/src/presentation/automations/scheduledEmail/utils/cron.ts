// (C) 2022-2026 GoodData Corporation

export function getDefaultCronExpression(date: Date) {
    return `0 0 ${date.getHours()} ? * *`;
}
