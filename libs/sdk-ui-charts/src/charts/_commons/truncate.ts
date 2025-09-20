// (C) 2019-2020 GoodData Corporation

export function truncate<T>(items: T | T[], maxLength: number): T[] {
    if (!items) {
        return [];
    }
    if (Array.isArray(items)) {
        // only get first two attributes
        return items.slice(0, maxLength);
    }
    return [items];
}
