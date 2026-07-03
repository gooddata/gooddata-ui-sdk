// (C) 2019-2026 GoodData Corporation

export const MAX_TITLE_LENGTH = 256;

export const TITLE_LENGTH_WARNING_LIMIT = 128;

export function getTitle(title: string): string {
    if (title && title.length > MAX_TITLE_LENGTH) {
        return title.substring(0, MAX_TITLE_LENGTH) + "...";
    }

    return title;
}
