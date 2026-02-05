// (C) 2026 GoodData Corporation

export function scopeRules<Scope extends string>(
    rules: Record<string, string | number | object | object[]>,
    scope: Scope,
): Record<`${Scope}/${string}`, string | number | object | object[]> {
    return Object.fromEntries(
        Object.entries(rules).map(([key, value]) => [`${scope}/${key}`, value]),
    ) as Record<`${Scope}/${string}`, string | number | object | object[]>;
}
