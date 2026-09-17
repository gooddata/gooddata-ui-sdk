// (C) 2026 GoodData Corporation

import { type Mock, vi } from "vitest";

/**
 * Shared vi.fn() mock instances and mock factories for contexts/hooks that more than one test file
 * needs to `vi.mock()`.
 *
 * The suite runs with `isolate: false` (see vitest.config.ts) to stay fast, which means test files
 * share one module graph. If two files each `vi.mock()` the same path with their own separately
 * `vi.hoisted()` `vi.fn()`, only one factory registration ends up backing that path for the whole
 * worker - the "losing" file's local mock reference goes stale, and its `mockReturnValue` calls
 * silently have no effect on what the rendered component actually receives (this reproduced as a
 * real, intermittent CI failure - see git history around 2026-08-27).
 *
 * Importing these shared instances instead - and still configuring them via `mockReturnValue` per
 * test, exactly as before - keeps every file pointed at the one mock that's genuinely wired up.
 */
export const useTotalLabelContextMock: Mock = vi.fn();
export const usePivotTablePropsMock: Mock = vi.fn();
export const useCurrentDataViewMock: Mock = vi.fn();

interface IMockAgGridApiResult {
    agGridApi: null;
    setAgGridApi: Mock;
}

export function mockUseAgGridApi(): IMockAgGridApiResult {
    return { agGridApi: null, setAgGridApi: vi.fn() };
}

interface IMockHeaderMenuResult {
    aggregationsItems: never[];
    textWrappingItems: never[];
    sortingItems: never[];
    sortDirection: null;
    sortIndex: undefined;
    hasMenuItems: boolean;
    handleAggregationsItemClick: Mock;
    handleTextWrappingItemClick: Mock;
    handleSortingItemClick: Mock;
    handleHeaderClick: Mock;
    headerCellAriaLabel: undefined;
}

export function mockUseHeaderMenu(): IMockHeaderMenuResult {
    return {
        aggregationsItems: [],
        textWrappingItems: [],
        sortingItems: [],
        sortDirection: null,
        sortIndex: undefined,
        hasMenuItems: false,
        handleAggregationsItemClick: vi.fn(),
        handleTextWrappingItemClick: vi.fn(),
        handleSortingItemClick: vi.fn(),
        handleHeaderClick: vi.fn(),
        headerCellAriaLabel: undefined,
    };
}
