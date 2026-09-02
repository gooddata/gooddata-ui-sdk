// (C) 2026 GoodData Corporation

import { Rules } from "../types.js";

export function scopeRules<Scope extends string>(rules: Rules, scope: Scope): Rules<Scope> {
    return Object.fromEntries(
        Object.entries(rules).map(([key, value]) => [`${scope}/${key}`, value]),
    ) as Rules<Scope>;
}
