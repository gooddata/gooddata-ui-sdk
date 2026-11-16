// (C) 2021-2026 GoodData Corporation

export const validId = /^(?!\.)[.A-Z0-9_-]{1,255}$/i;

export function validateIdPattern(id: string): boolean {
    return validId.test(id);
}
