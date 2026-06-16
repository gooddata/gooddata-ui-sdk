// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { useCancelablePromise, useDebouncedState } from "@gooddata/sdk-ui";

import type { IUiAutocompleteOption, IUiAutocompleteSection } from "./types.js";

type LoadResult<T extends IUiAutocompleteOption> = {
    sections: IUiAutocompleteSection<T>[];
    hasNextPage?: boolean;
};

/** @internal */
export type AsyncListSourceLoader<T extends IUiAutocompleteOption> = (
    search: string,
    page: number,
) => Promise<LoadResult<T>>;

/** @internal */
export interface IUseAsyncListSourceOptions {
    debounceMs: number;
}

/**
 * `loadingMore` keeps prior pages visible while the next page is in flight;
 * `error` blanks out the list.
 *
 * @internal
 */
export type AsyncListStatus = "loading" | "loadingMore" | "idle" | "error";

/** @internal */
export interface IAsyncListSource<T extends IUiAutocompleteOption> {
    inputValue: string;
    setInputValue: (next: string) => void;
    sections: IUiAutocompleteSection<T>[];
    status: AsyncListStatus;
    hasNextPage: boolean;
    loadMore: () => void;
    reset: () => void;
    /** Re-run the current page-0 query — used to recover from an error state. */
    retry: () => void;
    /** Increments on each page-0 load; lets callers tag per-query synthetic rows. */
    generation: number;
}

/**
 * Extra pages accumulated by Load-more on top of the page-0 result. `generation`
 * ties them to the page-0 load they extend; once page-0 reloads (new query, or
 * backspacing to an earlier one) the generation advances and these pages drop.
 */
interface IPagination<T extends IUiAutocompleteOption> {
    generation: number;
    sections: IUiAutocompleteSection<T>[];
    pagesLoaded: number;
    hasNextPage: boolean;
    pendingPage: number | null;
}

/**
 * Async data source for an autocomplete-shaped picker: debounce via
 * `useDebouncedState`, fetching with stale-result protection via
 * `useCancelablePromise`, section merge on pagination.
 *
 * @internal
 */
export function useAsyncListSource<T extends IUiAutocompleteOption>(
    loadOptions: AsyncListSourceLoader<T>,
    { debounceMs }: IUseAsyncListSourceOptions,
): IAsyncListSource<T> {
    const [inputValue, setInputValue, debouncedQuery, setInputValueImmediate] = useDebouncedState(
        "",
        debounceMs,
    );

    // Bumping `retryToken` re-runs page-0 even when the query is unchanged, so a
    // failed load can recover (e.g. when the popup is reopened) without the user
    // having to edit the search text.
    const [retryToken, setRetryToken] = useState(0);
    const retry = useCallback(() => setRetryToken((t) => t + 1), []);

    // Each page-0 load bumps the generation; Load-more pages are tagged with the
    // generation they belong to and ignored once it advances. Counting loads
    // (not comparing result objects) stays correct even if a loader returns the
    // same object for a repeated query.
    const [generation, setGeneration] = useState(0);
    const queryLoad = useCancelablePromise(
        { promise: () => loadOptions(debouncedQuery, 0), onSuccess: () => setGeneration((g) => g + 1) },
        [debouncedQuery, loadOptions, retryToken],
    );

    const [paginationState, setPagination] = useState<IPagination<T> | null>(null);
    const pagination = paginationState?.generation === generation ? paginationState : null;
    const pendingPage = pagination?.pendingPage ?? null;

    // While the typed value is ahead of the debounced one the fetch has not
    // started yet, but the UI must already report loading (and below, drop the
    // sections) so the previous query's options are not left clickable.
    const isDebouncing = inputValue !== debouncedQuery;
    const isQueryLoading = queryLoad.status === "pending" || queryLoad.status === "loading";

    useCancelablePromise(
        {
            // Hold pagination until page-0 of the current query has settled, so a
            // query change mid-pagination can't fetch the new query at an old page.
            promise:
                pendingPage == null || isDebouncing || isQueryLoading
                    ? null
                    : () => loadOptions(debouncedQuery, pendingPage),
            onSuccess: (result) =>
                setPagination((prev) =>
                    prev?.pendingPage == null
                        ? prev
                        : {
                              generation: prev.generation,
                              sections: mergeSections(prev.sections, result.sections),
                              pagesLoaded: prev.pagesLoaded + 1,
                              hasNextPage: !!result.hasNextPage,
                              pendingPage: null,
                          },
                ),
            // Keep the already-loaded pages; dropping back to idle re-shows the
            // Load-more row so the user can retry the failed page.
            onError: () => setPagination((prev) => (prev ? { ...prev, pendingPage: null } : prev)),
        },
        [pendingPage, debouncedQuery, loadOptions, isDebouncing, isQueryLoading],
    );

    const status: AsyncListStatus =
        isDebouncing || isQueryLoading
            ? "loading"
            : queryLoad.status === "error"
              ? "error"
              : pendingPage == null
                ? "idle"
                : "loadingMore";

    const sections = useMemo<IUiAutocompleteSection<T>[]>(() => {
        if (status === "loading" || status === "error" || queryLoad.result === undefined) {
            return [];
        }
        return pagination
            ? mergeSections(queryLoad.result.sections, pagination.sections)
            : queryLoad.result.sections;
    }, [status, queryLoad.result, pagination]);

    const hasNextPage =
        (status === "idle" || status === "loadingMore") &&
        (pagination ? pagination.hasNextPage : !!queryLoad.result?.hasNextPage);

    const loadMore = useCallback(() => {
        if (status !== "idle" || !hasNextPage) {
            return;
        }
        setPagination({
            generation,
            sections: pagination?.sections ?? [],
            pagesLoaded: pagination?.pagesLoaded ?? 0,
            hasNextPage,
            pendingPage: (pagination?.pagesLoaded ?? 0) + 1,
        });
    }, [status, hasNextPage, generation, pagination]);

    // `setInputValueImmediate` from useDebouncedState isn't memoized, but it only
    // delegates to stable `useState` setters, so omitting it keeps `reset`
    // referentially stable without going stale.
    const reset = useCallback(() => {
        setInputValueImmediate("");
        setPagination(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return useMemo(
        () => ({
            inputValue,
            setInputValue,
            sections,
            status,
            hasNextPage,
            loadMore,
            reset,
            retry,
            generation,
        }),
        [inputValue, setInputValue, sections, status, hasNextPage, loadMore, reset, retry, generation],
    );
}

function mergeSections<T extends IUiAutocompleteOption>(
    current: IUiAutocompleteSection<T>[],
    incoming: IUiAutocompleteSection<T>[],
): IUiAutocompleteSection<T>[] {
    const merged = current.map((s) => ({ ...s, options: [...s.options] }));
    for (const next of incoming) {
        const existing = merged.find((s) => s.id === next.id);
        if (existing) {
            existing.options.push(...next.options);
        } else {
            merged.push({ ...next, options: [...next.options] });
        }
    }
    return merged;
}
