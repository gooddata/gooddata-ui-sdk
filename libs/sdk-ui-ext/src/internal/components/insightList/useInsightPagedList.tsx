// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useRef, useState } from "react";

import { debounce, isEmpty } from "lodash-es";

import { type IAnalyticalBackend, type IFilterBaseOptions } from "@gooddata/sdk-backend-spi";
import { type IInsight } from "@gooddata/sdk-model";
import { type ITab } from "@gooddata/sdk-ui-kit";

const ITEMS_PER_PAGE = 50;

/**
 * Sort field for the insights paged list. Mirrors `InsightPickerSortBy` in the public API.
 * @internal
 */
export type InsightListSortBy = "lastModified" | "name";

/**
 * Sort direction for the insights paged list.
 * @internal
 */
export type InsightListSortDirection = "asc" | "desc";

/**
 * Tabs ids for insights paged list hook
 * @internal
 */
export interface ITabsIds {
    my: string;
    all: string;
}

/**
 * Config for useInsightPagedList hook
 * @internal
 */
export interface IUsePagedDropdownConfig {
    backend: IAnalyticalBackend;
    workspaceId: string;
    author: string | undefined;
    tabsIds: ITabsIds;
    tags?: string[];
    excludeTags?: string[];
    /**
     * Sort field. When omitted, defaults to the backend's default ordering
     * (modifiedAt, createdAt, title — descending).
     */
    sortBy?: InsightListSortBy;
    /**
     * Sort direction. Defaults to "desc".
     */
    sortDirection?: InsightListSortDirection;
    /**
     * When provided, filters insights by these author IDs (createdBy).
     * Replaces the tab-based author filtering.
     */
    createdByFilter?: string[];
    /**
     * When true, always includes createdBy/modifiedBy in the query response
     * so author metadata is available on loaded insights.
     * Only used by the enhanced insight picker — other consumers should leave this off.
     */
    includeAuthorInfo?: boolean;
}

/**
 * Result of useInsightPagedList hook
 * @internal
 */
export interface IUsePagedDropdownResult {
    items: IInsight[];
    totalItemsCount: number | undefined;
    isLoading: boolean;
    isNextPageLoading: boolean;
    initialLoadCompleted: boolean;
    currentPage: number;
    search: string;
    selectedTabId: string;
    hasNextPage: boolean;
    skeletonItemsCount: number;
    fetchItems: (params: {
        page: number;
        search: string;
        tabId: string;
        resetItems?: boolean;
    }) => Promise<void>;
    loadNextPage: () => void;
    onSearch: (searchString: string) => void;
    onTabSelect?: (tab: ITab) => void;
    reset: () => void;
    shouldLoadNextPage: (lastItemIndex: number, itemsCount: number) => boolean;
    loadInitialItems: () => void;
    resetItems: () => void;
}

const DEFAULT_SORT_DIRECTION: InsightListSortDirection = "desc";

function buildSorting(sortBy: InsightListSortBy | undefined, direction: InsightListSortDirection) {
    if (sortBy === "name") {
        return [`title,${direction}`];
    }
    return [`modifiedAt,createdAt,title,${direction}`];
}

/**
 * Hook to fetch insights paged list
 * @param backend - analytical backend
 * @param workspaceId - workspace id
 * @param author - author
 * @param tabsIds - tabs ids
 * @param tags - fetch only the insights with these tags
 * @param excludeTags - omit insights with these tags during fetch
 * @param sortBy - sort field
 * @param sortDirection - sort direction
 * @returns useInsightPagedList result
 *
 * @internal
 */
export function useInsightPagedList({
    backend,
    workspaceId,
    author,
    tabsIds,
    tags,
    excludeTags,
    sortBy,
    sortDirection = DEFAULT_SORT_DIRECTION,
    createdByFilter,
    includeAuthorInfo = false,
}: IUsePagedDropdownConfig): IUsePagedDropdownResult {
    const [items, setItems] = useState<IInsight[]>([]);
    const [totalItemsCount, setTotalItemsCount] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState("");
    const [selectedTabId, setSelectedTabId] = useState(tabsIds.my);

    const abortControllerRef = useRef<AbortController | null>(null);
    const initialLoadCompletedRef = useRef(false);

    const sorting = useMemo(() => buildSorting(sortBy, sortDirection), [sortBy, sortDirection]);

    const totalItems = totalItemsCount ?? items.length;
    const hasNextPage = totalItems > items.length;
    const skeletonItemsCount = hasNextPage ? Math.min(ITEMS_PER_PAGE, totalItems - items.length) : 0;

    const fetchItems = useCallback(
        async (params: { page: number; search: string; tabId: string | undefined; resetItems?: boolean }) => {
            const { page, search: searchValue, tabId = tabsIds.my, resetItems = false } = params;

            // Cancel any ongoing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();
            // Capture the current signal before the await to check the correct one after
            const currentSignal = abortControllerRef.current.signal;

            const isFirstPage = page === 0;
            // Show global loading when resetting items (tab switch, search) or on first page
            if (resetItems || isFirstPage) {
                setIsLoading(true);
                // Clear items immediately to show loading spinner
                if (resetItems) {
                    setItems([]);
                    setTotalItemsCount(undefined);
                }
            } else {
                setIsNextPageLoading(true);
            }

            try {
                const query = backend
                    .workspace(workspaceId)
                    .insights()
                    .getInsightsQuery()
                    .withSize(ITEMS_PER_PAGE)
                    .withPage(page)
                    .withSorting(sorting);

                const searchedTitle = searchValue || undefined;
                // When includeAuthorInfo is true (picker mode), only use the explicit createdByFilter.
                // Otherwise fall back to the legacy tab-based author filtering.
                const searchedAuthor =
                    !includeAuthorInfo && tabId === tabsIds.my && isEmpty(searchValue) ? author : undefined;
                const effectiveCreatedBy = createdByFilter?.length
                    ? createdByFilter
                    : searchedAuthor
                      ? [searchedAuthor]
                      : undefined;

                if (includeAuthorInfo || effectiveCreatedBy) {
                    query.withInclude(["createdBy", "modifiedBy"]);
                }

                const filter: IFilterBaseOptions = {
                    ...((tags?.length ?? 0) > 0 ? { tags } : {}),
                    ...((excludeTags?.length ?? 0) > 0 ? { excludeTags } : {}),
                    ...(searchedTitle ? { title: searchedTitle } : {}),
                    ...(effectiveCreatedBy ? { createdBy: effectiveCreatedBy } : {}),
                };

                if (Object.keys(filter).length > 0) {
                    query.withFilter(filter);
                }

                const result = await query.query();

                // Check if THIS request was aborted (using captured signal, not current ref)
                if (currentSignal.aborted) {
                    return;
                }

                setTotalItemsCount(result.totalCount);

                if (resetItems || isFirstPage) {
                    setItems(result.items);
                } else {
                    setItems((prevItems) => [...prevItems, ...result.items]);
                }

                // Handle initial load completion (use ref to avoid callback recreation)
                if (!initialLoadCompletedRef.current) {
                    initialLoadCompletedRef.current = true;
                    setInitialLoadCompleted(true);
                    // When the user has no insights of their own, switch to the All tab
                    if (tabId === tabsIds.my && result.totalCount === 0) {
                        setSelectedTabId(tabsIds.all);
                        // Fetch all insights immediately
                        const allQuery = backend
                            .workspace(workspaceId)
                            .insights()
                            .getInsightsQuery()
                            .withSize(ITEMS_PER_PAGE)
                            .withPage(0)
                            .withSorting(sorting);

                        const allFilter: IFilterBaseOptions = {
                            ...((tags?.length ?? 0) > 0 ? { tags } : {}),
                            ...((excludeTags?.length ?? 0) > 0 ? { excludeTags } : {}),
                        };

                        if (Object.keys(allFilter).length > 0) {
                            allQuery.withFilter(allFilter);
                        }

                        const allResult = await allQuery.query();

                        if (!currentSignal.aborted) {
                            setItems(allResult.items);
                            setTotalItemsCount(allResult.totalCount);
                        }
                        return;
                    }
                }
            } catch (error) {
                // Ignore abort errors
                if ((error as Error).name !== "AbortError") {
                    console.error("Failed to fetch insights:", error);
                }
            } finally {
                // Only update loading state if this request wasn't superseded
                if (!currentSignal.aborted) {
                    setIsLoading(false);
                    setIsNextPageLoading(false);
                }
            }
        },
        [
            backend,
            workspaceId,
            author,
            tabsIds,
            tags,
            excludeTags,
            sorting,
            createdByFilter,
            includeAuthorInfo,
        ],
    );

    const loadNextPage = useCallback(() => {
        if (!hasNextPage || isNextPageLoading || isLoading) {
            return;
        }
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        void fetchItems({ page: nextPage, search, tabId: selectedTabId });
    }, [hasNextPage, isNextPageLoading, isLoading, currentPage, search, selectedTabId, fetchItems]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSearch = useCallback(
        debounce((searchString: string) => {
            setCurrentPage(0);
            setSearch(searchString);
            void fetchItems({ page: 0, search: searchString, tabId: selectedTabId, resetItems: true });
        }, 500),
        [fetchItems, selectedTabId],
    );

    const onTabSelect = useCallback(
        (tab: ITab) => {
            const { id: tabId } = tab;
            setCurrentPage(0);
            setSelectedTabId(tabId);
            void fetchItems({ page: 0, search, tabId, resetItems: true });
        },
        [fetchItems, search],
    );

    const reset = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setItems([]);
        setTotalItemsCount(undefined);
        setIsLoading(false);
        setIsNextPageLoading(false);
        setCurrentPage(0);
        setSearch("");
    }, []);

    const shouldLoadNextPage = useCallback(
        (lastItemIndex: number, itemsCount: number) => lastItemIndex >= itemsCount - 5,
        [],
    );

    const loadInitialItems = useCallback(() => {
        setCurrentPage(0);
        void fetchItems({ page: 0, search: "", tabId: undefined, resetItems: true });
    }, [fetchItems]);

    const resetItems = useCallback(() => {
        setCurrentPage(0);
        void fetchItems({ page: 0, search: search, tabId: selectedTabId, resetItems: true });
    }, [fetchItems, search, selectedTabId]);

    return {
        items,
        totalItemsCount,
        isLoading,
        isNextPageLoading,
        initialLoadCompleted,
        currentPage,
        search,
        selectedTabId,
        hasNextPage,
        skeletonItemsCount,
        fetchItems,
        loadNextPage,
        onSearch,
        onTabSelect,
        reset,
        shouldLoadNextPage,
        loadInitialItems,
        resetItems,
    };
}
