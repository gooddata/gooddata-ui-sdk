// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type InsightPickerSortBy, type InsightPickerSortDirection } from "./types.js";

/**
 * Managed state for the InsightPicker component.
 * Use this hook in the consumer to own all picker state so it persists
 * across open/close cycles. Spread the returned object into `<InsightPicker>`.
 *
 * @param author - current user identifier; when provided, authorFilter defaults to [author] ("Me")
 * @internal
 */
export function useInsightPickerState(author?: string) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<InsightPickerSortBy>("lastModified");
    const [sortDirection, setSortDirection] = useState<InsightPickerSortDirection>("desc");
    const [authorFilter, setAuthorFilter] = useState<string[]>(author ? [author] : []);
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    // Latches to true on first user change and stays latched — once the user picks their own
    // filter, we never re-apply the "Me" default, even if `author` arrives late.
    const [isAuthorFilterModified, setIsAuthorFilterModified] = useState(false);

    useEffect(() => {
        if (!author || isAuthorFilterModified) {
            return;
        }

        const isAuthorFilterInSync = authorFilter.length === 1 && authorFilter[0] === author;
        if (!isAuthorFilterInSync) {
            setAuthorFilter([author]);
        }
    }, [author, authorFilter, isAuthorFilterModified]);

    const onAuthorFilterChange = useCallback((nextAuthorFilter: string[]) => {
        setIsAuthorFilterModified(true);
        setAuthorFilter(nextAuthorFilter);
    }, []);

    const onSortChange = useCallback(
        (newSortBy: InsightPickerSortBy, newDirection: InsightPickerSortDirection) => {
            setSortBy(newSortBy);
            setSortDirection(newDirection);
        },
        [],
    );

    return {
        searchQuery,
        onSearchChange: setSearchQuery,
        sortBy,
        sortDirection,
        onSortChange,
        authorFilter,
        onAuthorFilterChange,
        isAuthorFilterModified,
        tagFilter,
        onTagFilterChange: setTagFilter,
    };
}
