// (C) 2026 GoodData Corporation

/**
 * MAQL spells the computed-attribute object type with an underscore (`{computed_attribute/id}`),
 * while the Tiger entity type it maps onto is camelCase (`computedAttribute`). Every other MAQL
 * object type is spelled the same on both sides, so this is the only bridge the two need.
 */
const MAQL_OBJECT_TYPE_TO_TIGER_TYPE: Readonly<Record<string, string>> = {
    computed_attribute: "computedAttribute",
};

const TIGER_TYPE_TO_MAQL_OBJECT_TYPE: Readonly<Record<string, string>> = Object.fromEntries(
    Object.entries(MAQL_OBJECT_TYPE_TO_TIGER_TYPE).map(([maqlType, tigerType]) => [tigerType, maqlType]),
);

/**
 * Translates an object type as written in MAQL into the Tiger entity type it denotes. Types that
 * are spelled identically on both sides are returned unchanged, so this is safe to apply to any
 * `{type/id}` token before looking the type up.
 *
 * Keep the MAQL spelling for anything user-facing (diagnostics quote what the author wrote).
 *
 * @internal
 */
export function normalizeMaqlObjectType(maqlObjectType: string): string {
    return MAQL_OBJECT_TYPE_TO_TIGER_TYPE[maqlObjectType] ?? maqlObjectType;
}

/**
 * Translates a Tiger entity type into the way MAQL spells it. Use it whenever a `{type/id}`
 * reference is written back into MAQL text - a catalog object carries the Tiger type, which the
 * parser would reject for computed attributes.
 */
export function toMaqlObjectType(tigerType: string): string {
    return TIGER_TYPE_TO_MAQL_OBJECT_TYPE[tigerType] ?? tigerType;
}
