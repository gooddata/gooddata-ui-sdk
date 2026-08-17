// (C) 2026 GoodData Corporation

/** Maximum permitted length for an automation title, inclusive. */
export const MAX_AUTOMATION_TITLE_LENGTH = 255;

/** Returns whether an automation title is within the permitted length. */
export function isAutomationTitleValid(value: string): boolean {
    return value.length <= MAX_AUTOMATION_TITLE_LENGTH;
}
