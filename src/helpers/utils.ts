// (C) 2007-2018 GoodData Corporation
export function getObjectIdFromUri(uri: string): string {
    const match = /\/obj\/([^$\/\?]*)/.exec(uri);
    return match ? match[1] : null;
}
