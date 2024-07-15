// (C) 2022-2024 GoodData Corporation

/**
 * In order to match backend format, we need to remove milliseconds from the date.
 * Otherwise comparing newly created dates (as ISO string) with ISO dates from backend will fail.
 */
export const toModifiedISOString = (date: Date) => {
    return date.toISOString().split(".")[0] + "Z";
};
