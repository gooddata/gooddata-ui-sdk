// (C) 2024 GoodData Corporation

import * as React from "react";
import { GenAISemanticSearchType, ISemanticSearchResultItem } from "@gooddata/sdk-model";

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
    selectedItemType: GenAISemanticSearchType | null;
};

export type UseSearchMetricsCallback = (metricsData: ISearchMetrics) => void;

export type UseSearchMetricsReturn = {
    onCloseMetrics: () => void;
    onSelectMetrics: (item: ISemanticSearchResultItem) => void;
    onSearchMetrics: (searchTerm: string) => void;
};

type ISearchMetricsRef = {
    state: ISearchMetrics;
    reported: boolean;
};

const defaultOnSearchMetrics: ISearchMetricsRef = {
    state: {
        lastSearchTerm: "",
        searchCount: 0,
        selectedItemTitle: null,
        selectedItemType: null,
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
    const searchMetricsRef = React.useRef<ISearchMetricsRef>(defaultOnSearchMetrics);

    // Callback will be called when the search is closed
    const onCloseMetrics = React.useCallback(() => {
        // Do not report the metrics if it was already reported
        // i.e. by onSelect callback
        if (searchMetricsRef.current.reported) return;

        // Calling callback with null values
        callback?.({
            ...searchMetricsRef.current.state,
            selectedItemTitle: null,
            selectedItemType: null,
        });

        // Flush the metrics data
        searchMetricsRef.current = defaultOnSearchMetrics;
    }, [callback]);

    // Callback will be called when the user selects an item
    const onSelectMetrics = React.useCallback(
        (item: ISemanticSearchResultItem) => {
            // Report the metrics
            callback?.({
                ...searchMetricsRef.current.state,
                selectedItemTitle: item.title,
                selectedItemType: item.type,
            });
            // Mark the metrics as reported
            // Do not flush the metric data, because user might select several items in sequence
            // e.g. when cmd+click and open it in a new tab
            searchMetricsRef.current.reported = true;
        },
        [callback],
    );

    // Callback will be called when the user types in the search input
    const onSearchMetrics = React.useCallback((searchTerm: string) => {
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
                searchCount: shouldIncrement ? searchCount + 1 : searchCount,
            },
            reported: false,
        };
    }, []);

    return {
        onCloseMetrics,
        onSelectMetrics,
        onSearchMetrics,
    };
};
