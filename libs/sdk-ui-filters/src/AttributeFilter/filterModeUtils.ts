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
    type AttributeFilterAvailableMode,
    type AttributeFilterMode,
    type AttributeFilterTextMode,
} from "./filterModeTypes.js";

/**
 * Determines the filter mode from the filter type.
 *
 * @param filter - extended attribute filter
 * @returns filter mode
 * @alpha
 */
export function getFilterModeFromFilter(filter: IAttributeFilter | undefined): AttributeFilterMode {
    if (!filter) {
        return "elements";
    }

    // Both arbitrary and match filters use "text" mode
    if (isArbitraryAttributeFilter(filter) || isMatchAttributeFilter(filter)) {
        return "text";
    }

    return "elements";
}

/**
 * Determines the public available mode from filter type.
 *
 * @alpha
 */
export function getAvailableModeFromFilter(
    filter: IAttributeFilter | undefined,
): AttributeFilterAvailableMode {
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
 * Maps public available modes to internal menu modes.
 *
 * @alpha
 */
export function mapAvailableModesToInternal(
    modes: AttributeFilterAvailableMode[] | undefined,
): AttributeFilterMode[] {
    const available = modes ?? ["elements", "arbitrary", "match"];
    const mapped = new Set<AttributeFilterMode>();

    if (available.includes("elements")) {
        mapped.add("elements");
    }
    if (available.includes("arbitrary") || available.includes("match")) {
        mapped.add("text");
    }

    return Array.from(mapped);
}

/**
 * Resolves text-only available modes from public available modes.
 *
 * @alpha
 */
export function getAvailableTextModes(
    modes: AttributeFilterAvailableMode[] | undefined,
): AttributeFilterTextMode[] {
    const available = modes ?? ["elements", "arbitrary", "match"];
    const textModes: AttributeFilterTextMode[] = [];

    if (available.includes("arbitrary")) {
        textModes.push("arbitrary");
    }
    if (available.includes("match")) {
        textModes.push("match");
    }

    if (textModes.length === 0) {
        return ["arbitrary", "match"];
    }

    return textModes;
}

/**
 * Creates an empty filter for the specified mode.
 *
 * @param mode - filter mode
 * @param displayForm - display form reference
 * @param localIdentifier - optional local identifier
 * @returns empty filter of the specified type
 * @alpha
 */
export function createEmptyFilterForMode(
    mode: AttributeFilterMode,
    displayForm: ObjRef,
    localIdentifier?: string,
): IAttributeFilter {
    if (mode === "text") {
        // Default to "is" operator (arbitrary positive)
        return newArbitraryAttributeFilter(displayForm, [], false, localIdentifier);
    }

    // elements mode - create negative filter with empty selection (All)
    return newNegativeAttributeFilter(displayForm, { uris: [] }, localIdentifier);
}

/**
 * Creates an empty filter for the specified public mode.
 *
 * @alpha
 */
export function createEmptyFilterForAvailableMode(
    mode: AttributeFilterAvailableMode,
    displayForm: ObjRef,
    localIdentifier?: string,
): IAttributeFilter {
    if (mode === "elements") {
        return newNegativeAttributeFilter(displayForm, { uris: [] }, localIdentifier);
    }

    if (mode === "arbitrary") {
        return newArbitraryAttributeFilter(displayForm, [], false, localIdentifier);
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
