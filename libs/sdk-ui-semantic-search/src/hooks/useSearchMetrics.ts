// (C) 2024-2025 GoodData Corporation

import { useCallback, useRef } from "react";
import { GenAIObjectType, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { ListItem } from "../types.js";

/**
 * A conclusion of a single search action by the user.
 * Used to collect usage metrics.
 * @internal
 */
export type ISearchMetrics = {
    /**
     * The last search term.
     */
    lastSearchTerm: string;
    /**
     * Scores of the last search results.
     */
    lastSearchScores: number[];
    /**
     * Number of times the search feed was triggered.
     */
    searchCount: number;
    /**
     * A title of the selected item, if any.
     * Null means the search was closed without selecting an item.
     */
    selectedItemTitle: string | null;
    /**
     * The type of the selected item, if any.
     * Null means the search was closed without selecting an item.
     */
    selectedItemType: GenAIObjectType | null;
    /**
     * The score of the selected item, if any.
     */
    selectedItemScore: number | null;
    /**
     * The index of the selected item, if any.
     */
    selectedItemIndex: number | null;
};

export type UseSearchMetricsCallback = (metricsData: ISearchMetrics) => void;

export type UseSearchMetricsReturn = {
    onCloseMetrics: () => void;
    onSelectMetrics: (item: ISemanticSearchResultItem, index?: number) => void;
    onSearchMetrics: (searchTerm: string, searchResults?: ListItem<ISemanticSearchResultItem>[]) => void;
};

type ISearchMetricsRef = {
    state: ISearchMetrics;
    reported: boolean;
};

const defaultOnSearchMetrics: ISearchMetricsRef = {
    state: {
        lastSearchTerm: "",
        lastSearchScores: [],
        searchCount: 0,
        selectedItemTitle: null,
        selectedItemType: null,
        selectedItemScore: null,
        selectedItemIndex: null,
    },
    reported: false,
};

/**
 * A hook that helps to collect usage metrics for the search overlay.
 * Reporting is done on a search transaction, i.e.:
 * - open + close (= report transaction)
 * - open + type + close (= report transaction)
 * - open + type + select (= report transaction)
 * - open + type + select (= report transaction) + type + close (= report transaction)
 * @internal
 */
export const useSearchMetrics = (callback?: UseSearchMetricsCallback): UseSearchMetricsReturn => {
    // Use ref because we don't want to cause redraw with the new metrics data
    const searchMetricsRef = useRef<ISearchMetricsRef>(defaultOnSearchMetrics);

    // Callback will be called when the search is closed
    const onCloseMetrics = useCallback(() => {
        // Do not report the metrics if it was already reported
        // i.e. by onSelect callback
        if (searchMetricsRef.current.reported) return;

        // Calling callback with null values
        callback?.({
            ...searchMetricsRef.current.state,
            selectedItemTitle: null,
            selectedItemType: null,
            selectedItemScore: null,
            selectedItemIndex: null,
        });

        // Flush the metrics data
        searchMetricsRef.current = defaultOnSearchMetrics;
    }, [callback]);

    // Callback will be called when the user selects an item
    const onSelectMetrics = useCallback(
        (item: ISemanticSearchResultItem, index?: number) => {
            // Report the metrics
            callback?.({
                ...searchMetricsRef.current.state,
                selectedItemTitle: item.title,
                selectedItemType: item.type,
                selectedItemScore: item.score ?? 0,
                selectedItemIndex: index ?? null,
            });
            // Mark the metrics as reported
            // Do not flush the metric data, because user might select several items in sequence
            // e.g. when cmd+click and open it in a new tab
            searchMetricsRef.current.reported = true;
        },
        [callback],
    );

    // Callback will be called when the user types in the search input
    const onSearchMetrics = useCallback(
        (searchTerm: string, searchResults?: ListItem<ISemanticSearchResultItem>[]) => {
            const { searchCount, lastSearchTerm } = searchMetricsRef.current.state;

            // We do not want to count the case when the user continues to type the same search term
            const shouldIncrement = !(lastSearchTerm === ""
                ? searchTerm === ""
                : searchTerm.startsWith(lastSearchTerm));

            // Also reset reported flag to catch type -> select -> type -> close sequence
            searchMetricsRef.current = {
                state: {
                    ...searchMetricsRef.current.state,
                    lastSearchTerm: searchTerm,
                    lastSearchScores: searchResults?.map((result) => result.item.score ?? 0) ?? [],
                    searchCount: shouldIncrement ? searchCount + 1 : searchCount,
                },
                reported: false,
            };
        },
        [],
    );

    return {
        onCloseMetrics,
        onSelectMetrics,
        onSearchMetrics,
    };
};
