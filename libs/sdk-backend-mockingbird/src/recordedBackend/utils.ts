// (C) 2019-2021 GoodData Corporation

/**
 * @internal
 */
export function identifierToRecording(id: string): string {
    return id.replace(/\./g, "_");
}
