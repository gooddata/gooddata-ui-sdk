// (C) 2026 GoodData Corporation

import { RuleValue } from "../types.js";

export function scopeRules<Scope extends string>(
    rules: Record<string, RuleValue>,
    scope: Scope,
): Record<`${Scope}/${string}`, RuleValue> {
    return Object.fromEntries(
        Object.entries(rules).map(([key, value]) => [`${scope}/${key}`, value]),
    ) as Record<`${Scope}/${string}`, RuleValue>;
}
