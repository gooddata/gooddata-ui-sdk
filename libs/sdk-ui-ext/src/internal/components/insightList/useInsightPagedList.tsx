// (C) 2026 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { debounce, isEmpty } from "lodash-es";

import { type IAnalyticalBackend, type IInsightsQueryOptions } from "@gooddata/sdk-backend-spi";
import { type IInsight } from "@gooddata/sdk-model";
import { type ITab } from "@gooddata/sdk-ui-kit";

const ITEMS_PER_PAGE = 50;

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

/**
 * Hook to fetch insights paged list
 * @param backend - analytical backend
 * @param workspaceId - workspace id
 * @param author - author
 * @param tabsIds - tabs ids
 * @returns useInsightPagedList result
 *
 * @internal
 */
export function useInsightPagedList({
    backend,
    workspaceId,
    author,
    tabsIds,
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
                const options: IInsightsQueryOptions = {
                    limit: ITEMS_PER_PAGE,
                    offset: page * ITEMS_PER_PAGE,
                    title: searchValue || undefined,
                    author: tabId === tabsIds.my && isEmpty(searchValue) ? author : undefined,
                    orderBy: "updated",
                };

                const result = await backend.workspace(workspaceId).insights().getInsights(options);

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
                        const allResult = await backend.workspace(workspaceId).insights().getInsights({
                            limit: ITEMS_PER_PAGE,
                            offset: 0,
                            orderBy: "updated",
                        });

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
        [backend, workspaceId, author, tabsIds],
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
        void fetchItems({ page: 0, search: "", tabId: undefined, resetItems: true });
    }, [fetchItems]);

    const resetItems = useCallback(() => {
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
