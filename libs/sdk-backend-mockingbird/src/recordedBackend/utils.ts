// (C) 2019 GoodData Corporation

export function identifierToRecording(id: string): string {
    return id.replace(/\./g, "_");
}
