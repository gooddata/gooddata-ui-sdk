// (C) 2019-2022 GoodData Corporation
export const MAX_TITLE_LENGTH = 256;
export const MAX_DESCRIPTION_LENGTH = 1024;

export const TITLE_LENGTH_WARNING_LIMIT = 128;
export const DESCRIPTION_LENGTH_WARNING_LIMIT = 512;

export function getTitle(title: string): string {
    if (title && title.length > MAX_TITLE_LENGTH) {
        return title.substring(0, MAX_TITLE_LENGTH) + "...";
    }

    return title;
}

export function getDescription(description: string): string {
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
        return description.substring(0, MAX_DESCRIPTION_LENGTH) + "...";
    }

    return description;
}
