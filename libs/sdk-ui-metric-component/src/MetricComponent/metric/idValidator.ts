// (C) 2021-2026 GoodData Corporation

export const validId = /^(?!\.)[.A-Za-z0-9_-]{1,255}$/;

export function validateIdPattern(id: string): boolean {
    return validId.test(id);
}
