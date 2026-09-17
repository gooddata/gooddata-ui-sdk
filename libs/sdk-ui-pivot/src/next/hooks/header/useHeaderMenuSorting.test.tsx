// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type AgGridHeaderGroupParams, type AgGridHeaderParams } from "../../types/agGrid.js";

import { useHeaderMenuSorting } from "./useHeaderMenuSorting.js";

function wrapper({ children }: { children: ReactNode }) {
    return (
        <IntlProvider
            locale="en-US"
            messages={{
                "visualizations.menu.sort.ascending": "Sort ascending",
                "visualizations.menu.sort.descending": "Sort descending",
                "visualizations.table.header.aria.sortedAscending": "ascending",
                "visualizations.table.header.aria.sortedDescending": "descending",
                "visualizations.table.header.aria.sorted": "sorted {direction}",
                "visualizations.table.header.aria.priority": "priority {rank}",
            }}
        >
            {children}
        </IntlProvider>
    );
}

function buildParams(options: { displayName?: string; sortDirection?: "asc" | "desc" | null } = {}) {
    const { displayName = "Sum", sortDirection = null } = options;

    return {
        column: {
            getColDef: () => ({ sortable: true }),
            getSort: () => sortDirection ?? undefined,
            getSortIndex: () => null,
        },
        api: {
            getColumnState: () => [],
        },
        displayName,
        setSort: vi.fn(),
        progressSort: vi.fn(),
    } as unknown as AgGridHeaderParams;
}

function buildGroupParams(options: { displayName?: string } = {}) {
    const { displayName = "Sum" } = options;

    return {
        columnGroup: {},
        displayName,
    } as unknown as AgGridHeaderGroupParams;
}

describe("useHeaderMenuSorting", () => {
    it("uses the column's own display name for the header's ARIA label when there is no override", () => {
        const { result } = renderHook(() => useHeaderMenuSorting(buildParams({ displayName: "Sum" })), {
            wrapper,
        });

        expect(result.current.headerCellAriaLabel).toBe("Sum");
    });

    it("uses the override for the header's ARIA label instead of the column's own display name (a renamed total)", () => {
        const { result } = renderHook(
            () => useHeaderMenuSorting(buildParams({ displayName: "Sum" }), "Grand Total"),
            { wrapper },
        );

        expect(result.current.headerCellAriaLabel).toBe("Grand Total");
    });

    it("still uses the override when the column is sorted, not the stale display name", () => {
        const { result } = renderHook(
            () =>
                useHeaderMenuSorting(
                    buildParams({ displayName: "Sum", sortDirection: "asc" }),
                    "Grand Total",
                ),
            { wrapper },
        );

        expect(result.current.headerCellAriaLabel).toContain("Grand Total");
        expect(result.current.headerCellAriaLabel).not.toContain("Sum");
    });

    it("uses the override for a group header's ARIA label too (a renamed total rendered by PivotGroupHeader)", () => {
        const { result } = renderHook(
            () => useHeaderMenuSorting(buildGroupParams({ displayName: "Sum" }), "Grand Total"),
            { wrapper },
        );

        expect(result.current.headerCellAriaLabel).toBe("Grand Total");
    });

    it("returns an empty ARIA label for a group header with no override, leaving AG Grid's own computed accessible name alone", () => {
        const { result } = renderHook(() => useHeaderMenuSorting(buildGroupParams({ displayName: "Sum" })), {
            wrapper,
        });

        expect(result.current.headerCellAriaLabel).toBe("");
    });

    it("goes back to an empty ARIA label after an alias reset - useHeaderCellAriaLabel is responsible for then removing the stale attribute", () => {
        const { result, rerender } = renderHook<
            ReturnType<typeof useHeaderMenuSorting>,
            { override: string | undefined }
        >(({ override }) => useHeaderMenuSorting(buildGroupParams({ displayName: "Sum" }), override), {
            wrapper,
            initialProps: { override: "Grand Total" },
        });

        expect(result.current.headerCellAriaLabel).toBe("Grand Total");

        rerender({ override: undefined });

        expect(result.current.headerCellAriaLabel).toBe("");
    });
});
