// (C) 2007-2026 GoodData Corporation

import {
    type IAttributeFilter,
    type MatchFilterOperator,
    type ObjRef,
    isArbitraryAttributeFilter,
    isMatchAttributeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";

import {
    type AttributeFilterAvailableSelectionType,
    type AttributeFilterSelectionType,
    type AttributeFilterTextSelectionType,
} from "./selectionTypes.js";

/**
 * Determines the selection type from the filter type.
 *
 * @param filter - extended attribute filter
 * @returns selection type
 * @alpha
 */
export function getSelectionTypeFromFilter(
    filter: IAttributeFilter | undefined,
): AttributeFilterSelectionType {
    if (!filter) {
        return "elements";
    }

    // Both arbitrary and match filters use "text" selection type
    if (isArbitraryAttributeFilter(filter) || isMatchAttributeFilter(filter)) {
        return "text";
    }

    return "elements";
}

/**
 * Determines the public available selection type from filter type.
 *
 * @alpha
 */
export function getAvailableSelectionTypeFromFilter(
    filter: IAttributeFilter | undefined,
): AttributeFilterAvailableSelectionType {
    if (!filter) {
        return "elements";
    }

    if (isArbitraryAttributeFilter(filter)) {
        return "arbitrary";
    }

    if (isMatchAttributeFilter(filter)) {
        return "match";
    }

    return "elements";
}

/**
 * Maps public available selection types to internal selection types.
 *
 * @alpha
 */
export function mapAvailableSelectionTypesToInternal(
    selectionTypes: AttributeFilterAvailableSelectionType[] | undefined,
): AttributeFilterSelectionType[] {
    const available = selectionTypes ?? ["elements", "arbitrary", "match"];
    const mapped = new Set<AttributeFilterSelectionType>();

    if (available.includes("elements")) {
        mapped.add("elements");
    }
    if (available.includes("arbitrary") || available.includes("match")) {
        mapped.add("text");
    }

    return Array.from(mapped);
}

/**
 * Resolves text-only available selection types from public available selection types.
 *
 * @alpha
 */
export function getAvailableTextSelectionTypes(
    selectionTypes: AttributeFilterAvailableSelectionType[] | undefined,
): AttributeFilterTextSelectionType[] {
    const available = selectionTypes ?? ["elements", "arbitrary", "match"];
    const textSelectionTypes: AttributeFilterTextSelectionType[] = [];

    if (available.includes("arbitrary")) {
        textSelectionTypes.push("arbitrary");
    }
    if (available.includes("match")) {
        textSelectionTypes.push("match");
    }

    if (textSelectionTypes.length === 0) {
        return ["arbitrary", "match"];
    }

    return textSelectionTypes;
}

/**
 * Creates an empty filter for the specified selection type.
 *
 * @param selectionType - selection type
 * @param displayForm - display form reference
 * @param localIdentifier - optional local identifier
 * @returns empty filter of the specified type
 * @alpha
 */
export function createEmptyFilterForSelectionType(
    selectionType: AttributeFilterSelectionType,
    displayForm: ObjRef,
    localIdentifier?: string,
): IAttributeFilter {
    if (selectionType === "text") {
        // Default to "all" operator (arbitrary negative with empty values = All)
        return newArbitraryAttributeFilter(displayForm, [], true, localIdentifier);
    }

    // elements selection type - create negative filter with empty selection (All)
    return newNegativeAttributeFilter(displayForm, { uris: [] }, localIdentifier);
}

/**
 * Creates an empty filter for the specified public available selection type.
 *
 * @alpha
 */
export function createEmptyFilterForAvailableSelectionType(
    selectionType: AttributeFilterAvailableSelectionType,
    displayForm: ObjRef,
    localIdentifier?: string,
): IAttributeFilter {
    if (selectionType === "elements") {
        return newNegativeAttributeFilter(displayForm, { uris: [] }, localIdentifier);
    }

    if (selectionType === "arbitrary") {
        return newArbitraryAttributeFilter(displayForm, [], true, localIdentifier);
    }

    const defaultMatchOperator: MatchFilterOperator = "contains";
    return newMatchAttributeFilter(
        displayForm,
        defaultMatchOperator,
        "",
        { caseSensitive: false, negativeSelection: false },
        localIdentifier,
    );
}
