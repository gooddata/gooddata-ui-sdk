// (C) 2007-2026 GoodData Corporation

import {
    type IAttributeElement,
    type IAttributeFilter,
    type IAttributeFilterWithSelection,
    type ObjRef,
    isArbitraryAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isAttributeFilterWithSelection,
    isMatchAttributeFilter,
    isPositiveAttributeFilter,
    newArbitraryAttributeFilter,
    newMatchAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import { type IDecoratedMetricAttributeFilter } from "../../models/decorated_metric_attribute_filter.js";
import { type TextModeFilterData } from "../../store/filter_bar/filter_bar_types.js";
import { type IElement } from "../../typings/measure_filters.js";
import { type ICacheItemDisplayForm } from "../../typings/state_objects.js";

import { type IItemTitlesMap } from "./types.js";

export const isDisplayFormSelectVisible = (
    useAlternativeDisplayForms: boolean,
    availableDisplayForms: ICacheItemDisplayForm[],
) => {
    return useAlternativeDisplayForms && availableDisplayForms?.length > 1;
};

export const elementsToItemTitlesMap = (elements: IAttributeElement[]): IItemTitlesMap => {
    const accumulator: Record<string, IAttributeElement> = {};

    return elements.reduce((map, item) => {
        map[item.uri] = item;
        return map;
    }, accumulator);
};

export const mapFilterToSelectedItems = (
    filter: IAttributeFilter,
    itemTitlesMap: IItemTitlesMap,
): IElement[] => {
    if (!isAttributeFilterWithSelection(filter)) {
        return [];
    }
    const items = getSelectedItems(filter);

    if (isAttributeElementsByRef(items)) {
        return items.uris.map((uri) => {
            const itemTitle = itemTitlesMap[uri]?.title;
            return { title: itemTitle, uri };
        });
    } else if (isAttributeElementsByValue(items)) {
        // In analytical designer, attribute filter is always "uri" based.
        // In the past, we were relying on the fact, that tiger/panther does not support multiple labels and uri was always equal to the title.
        // This is not correct anymore, and all filters in panther and tiger are saved as values, so we need to send them as values also to AttributeFilter.
        // When we are converting it back to AD shape, we need to preserve the previous expectations/behavior.
        return items.values.map((value) => {
            const itemTitle = itemTitlesMap[value]?.title;
            const formattedItemTitle = itemTitlesMap[value]?.formattedTitle;
            return {
                title: itemTitle,
                uri: value,
                formattedTitle: formattedItemTitle,
            };
        });
    }
    return [];
};

export const getSelectedItems = (filter: IAttributeFilterWithSelection) => {
    if (isPositiveAttributeFilter(filter)) {
        return filter.positiveAttributeFilter.in;
    }
    return filter.negativeAttributeFilter.notIn;
};

/**
 * Extracts mode-specific data from an SDK attribute filter.
 * Returns undefined for element-based (positive/negative) filters.
 */
export const extractTextModeFilterData = (filter: IAttributeFilter): TextModeFilterData | undefined => {
    if (isArbitraryAttributeFilter(filter)) {
        const { values, negativeSelection } = filter.arbitraryAttributeFilter;
        return { mode: "arbitrary", values, negativeSelection };
    }
    if (isMatchAttributeFilter(filter)) {
        const { operator, literal, caseSensitive, negativeSelection } = filter.matchAttributeFilter;
        return {
            mode: "match",
            operator,
            literal,
            ...(caseSensitive === undefined ? {} : { caseSensitive }),
            ...(negativeSelection === undefined ? {} : { negativeSelection }),
        };
    }
    return undefined;
};

/**
 * Reconstructs an SDK attribute filter from mode-specific data, displayForm and localIdentifier.
 */
export const textModeFilterDataToSdkFilter = (
    data: TextModeFilterData,
    displayFormRef: ObjRef,
    localIdentifier: string,
): IAttributeFilter => {
    if (data.mode === "arbitrary") {
        return newArbitraryAttributeFilter(
            displayFormRef,
            data.values,
            data.negativeSelection,
            localIdentifier,
        );
    }
    return newMatchAttributeFilter(
        displayFormRef,
        data.operator,
        data.literal,
        {
            caseSensitive: data.caseSensitive,
            negativeSelection: data.negativeSelection,
        },
        localIdentifier,
    );
};

export const mapDecoratedFilterToFilter = (
    filter: IDecoratedMetricAttributeFilter,
    isPrimaryDisplayForm: boolean,
): IAttributeFilter => {
    const textModeData: TextModeFilterData = filter.textModeFilter;
    if (textModeData) {
        const attributeDf = filter.original?.displayFormRef;
        const localIdentifier = filter.original?.localIdentifier;
        return textModeFilterDataToSdkFilter(textModeData, attributeDf, localIdentifier);
    }

    const isInverted = filter.isInverted;
    const selectedElements = filter.selectedElements;
    const attributeDf = filter.original?.displayFormRef;
    const localIdentifier = filter.original?.localIdentifier;
    const elementsUris = selectedElements.map((item) => (isPrimaryDisplayForm ? item.uri : item.title));

    if (isInverted) {
        return newNegativeAttributeFilter(
            attributeDf,
            {
                uris: elementsUris,
            },
            localIdentifier,
        );
    }

    return newPositiveAttributeFilter(
        attributeDf,
        {
            uris: elementsUris,
        },
        localIdentifier,
    );
};
