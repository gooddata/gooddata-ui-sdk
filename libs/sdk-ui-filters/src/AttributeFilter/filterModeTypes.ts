// (C) 2007-2026 GoodData Corporation

/**
 * Attribute filter mode types.
 * - "elements": List-based selection (existing positive/negative filters)
 * - "text": Text-based filtering (arbitrary and match filters with operator)
 *
 * @alpha
 */
export type AttributeFilterMode = "elements" | "text";

/**
 * Publicly exposed available modes for AttributeFilter props.
 *
 * @alpha
 */
export type AttributeFilterAvailableMode = "elements" | "arbitrary" | "match";

/**
 * Publicly exposed text-specific modes.
 *
 * @alpha
 */
export type AttributeFilterTextMode = Extract<AttributeFilterAvailableMode, "arbitrary" | "match">;
