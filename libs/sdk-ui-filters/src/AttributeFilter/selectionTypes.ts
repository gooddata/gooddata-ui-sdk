// (C) 2007-2026 GoodData Corporation

/**
 * Attribute filter selection types.
 * - "elements": List-based selection (existing positive/negative filters)
 * - "text": Text-based filtering (arbitrary and match filters with operator)
 *
 * @alpha
 */
export type AttributeFilterSelectionType = "elements" | "text";

/**
 * Publicly exposed available selection types for AttributeFilter props.
 *
 * @alpha
 */
export type AttributeFilterAvailableSelectionType = "elements" | "arbitrary" | "match";

/**
 * Publicly exposed text-specific selection types.
 *
 * @alpha
 */
export type AttributeFilterTextSelectionType = Extract<
    AttributeFilterAvailableSelectionType,
    "arbitrary" | "match"
>;
