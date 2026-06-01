// (C) 2026 GoodData Corporation

import { useCallback, useRef, useState } from "react";

import { debounce } from "lodash-es";

import {
    type IAnalyticalBackend,
    type IAnalyticalWorkspace,
    type IWorkspaceDescriptor,
    type IWorkspacesQueryResult,
} from "@gooddata/sdk-backend-spi";

const ITEMS_PER_PAGE = 50;

/**
 * Conditional type that resolves workspace items based on resolveWorkspaceDescriptor flag.
 * - When true (default): returns IWorkspaceDescriptor[] (resolved descriptors with id, title, description)
 * - When false: returns IAnalyticalWorkspace[] (workspace handles with service methods)
 *
 * @alpha
 */
export type WorkspaceItems<TResolve extends boolean> = TResolve extends true
    ? IWorkspaceDescriptor[]
    : IAnalyticalWorkspace[];

/**
 * @alpha
 */
export interface IPagedWorkspacesConfig<TResolve extends boolean = true> {
    backend: IAnalyticalBackend;
    userId: string;
    resolveWorkspaceDescriptor?: TResolve;
}

/**
 * @alpha
 */
export interface IPagedWorkspacesResult<TResolve extends boolean = true> {
    items: WorkspaceItems<TResolve>;
    totalItemsCount: number | undefined;
    isLoading: boolean;
    isNextPageLoading: boolean;
    initialLoadCompleted: boolean;
    currentPage: number;
    search: string;
    hasNextPage: boolean;
    skeletonItemsCount: number;
    loadNextPage: () => void;
    onSearch: (searchString: string) => void;
    reset: () => void;
    loadInitialItems: () => void;
    shouldLoadNextPage: (lastItemIndex: number, itemsCount: number) => boolean;
}

/**
 * @alpha
 */
export function usePagedWorkspaces<TResolve extends boolean = true>({
    backend,
    userId,
    resolveWorkspaceDescriptor = true as TResolve,
}: IPagedWorkspacesConfig<TResolve>): IPagedWorkspacesResult<TResolve> {
    const [items, setItems] = useState<WorkspaceItems<TResolve>>([]);
    const [totalItemsCount, setTotalItemsCount] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState("");

    const initialLoadCompletedRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const totalItems = totalItemsCount ?? items.length;
    const hasNextPage = totalItems > items.length;
    const skeletonItemsCount = hasNextPage ? Math.min(ITEMS_PER_PAGE, totalItems - items.length) : 0;

    const fetchItems = useCallback(
        async (params: { page: number; search: string; resetItems?: boolean }) => {
            const { page, search, resetItems = false } = params;

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
                    setItems([] as WorkspaceItems<TResolve>);
                    setTotalItemsCount(undefined);
                }
            } else {
                setIsNextPageLoading(true);
            }

            try {
                const limit = ITEMS_PER_PAGE;
                const offset = page * ITEMS_PER_PAGE;
                const searchValue = search;

                let resultWorkspaces: IWorkspacesQueryResult;

                if (searchValue) {
                    resultWorkspaces = await backend
                        .workspaces()
                        .forUser(userId)
                        .withLimit(limit)
                        .withOffset(offset)
                        .withSearch(searchValue)
                        .query();
                } else {
                    resultWorkspaces = await backend
                        .workspaces()
                        .forUser(userId)
                        .withLimit(limit)
                        .withOffset(offset)
                        .query();
                }

                let fetchedItems: WorkspaceItems<TResolve>;

                if (resolveWorkspaceDescriptor) {
                    fetchedItems = (await Promise.all(
                        resultWorkspaces.items.map((workspace) => workspace?.getDescriptor()),
                    )) as WorkspaceItems<TResolve>;
                } else {
                    fetchedItems = resultWorkspaces.items as WorkspaceItems<TResolve>;
                }
                const totalItemsCount = resultWorkspaces.totalCount;

                // Check if THIS request was aborted (using captured signal, not current ref)
                if (currentSignal.aborted) {
                    return;
                }

                setTotalItemsCount(totalItemsCount);

                if (resetItems || isFirstPage) {
                    setItems(fetchedItems);
                } else {
                    setItems((prevItems) => [...prevItems, ...fetchedItems] as WorkspaceItems<TResolve>);
                }

                // Handle initial load completion
                if (!initialLoadCompletedRef.current) {
                    initialLoadCompletedRef.current = true;
                    setInitialLoadCompleted(true);
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
        [backend, userId, resolveWorkspaceDescriptor],
    );

    const loadNextPage = useCallback(() => {
        if (!hasNextPage || isNextPageLoading || isLoading) {
            return;
        }
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        void fetchItems({ page: nextPage, search });
    }, [hasNextPage, isNextPageLoading, isLoading, currentPage, search, fetchItems]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSearch = useCallback(
        debounce((searchString: string) => {
            setCurrentPage(0);
            setSearch(searchString);
            void fetchItems({ page: 0, search: searchString, resetItems: true });
        }, 500),
        [fetchItems],
    );

    const reset = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setItems([] as WorkspaceItems<TResolve>);
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
        void fetchItems({ page: 0, search: "", resetItems: true });
    }, [fetchItems]);

    return {
        items,
        totalItemsCount,
        isLoading,
        isNextPageLoading,
        initialLoadCompleted,
        currentPage,
        search,
        hasNextPage,
        skeletonItemsCount,
        loadInitialItems,
        loadNextPage,
        onSearch,
        reset,
        shouldLoadNextPage,
    };
}
