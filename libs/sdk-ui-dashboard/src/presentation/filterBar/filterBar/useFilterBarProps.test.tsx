// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type Store } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterAll, describe, expect, it, vi } from "vitest";

import {
    type IDashboardAbsoluteGranularityDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { initializeDashboard } from "../../../model/commands/dashboard.js";
import {
    changeDateFilterSelectionOfAnyType,
    clearDateFilterSelection,
} from "../../../model/commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../model/DashboardTester.js";
import { ReactDashboardContext } from "../../../model/react/DashboardStoreProvider.js";
import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";

import { useFilterBarProps } from "./DefaultFilterBar.js";

// Later files in the same worker mock modules this file loads; dropping them lets those mocks apply.
afterAll(() => {
    vi.resetModules();
});

// The hook passes the working selection flag although the prop type does not declare it.
type OnDateFilterChangedAtRuntime = (
    filter: IDashboardAbsoluteGranularityDateFilter,
    dateFilterOptionLocalId: string,
    isWorkingSelectionChange: boolean,
) => void;

describe("useFilterBarProps", () => {
    const granularityDateFilter: IDashboardAbsoluteGranularityDateFilter = {
        dashboardAbsoluteGranularityDateFilter: {
            granularity: "GDC.time.month",
            from: "2026-01",
            to: "2026-03",
        },
    };

    async function createTester(applyAllAtOnce = false): Promise<DashboardTester> {
        let Tester: DashboardTester | undefined;
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            applyAllAtOnce
                ? {
                      initCommand: initializeDashboard({
                          settings: { dashboardFiltersApplyMode: { mode: "ALL_AT_ONCE" } },
                      }),
                  }
                : undefined,
        );
        return Tester!;
    }

    function renderFilterBarProps(Tester: DashboardTester) {
        const dispatch = vi.fn();
        const store = {
            getState: () => Tester.state(),
            subscribe: () => () => {},
            dispatch,
        } as unknown as Store;
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <Provider
                store={store}
                context={ReactDashboardContext}
                stabilityCheck="never"
                identityFunctionCheck="never"
            >
                {children}
            </Provider>
        );
        const props = renderHook(() => useFilterBarProps(), { wrapper }).result.current;
        return { dispatch, props };
    }

    describe("onDateFilterChanged", () => {
        it("changes the selection of an absolute date filter with granularity", async () => {
            const { dispatch, props } = renderFilterBarProps(await createTester());

            props.onDateFilterChanged(granularityDateFilter, "opt");

            expect(dispatch).toHaveBeenCalledWith(
                changeDateFilterSelectionOfAnyType(granularityDateFilter, {
                    dateFilterOptionLocalId: "opt",
                    isWorkingSelectionChange: undefined,
                }),
            );
        });

        it.each([
            ["applies", false, false],
            ["keeps as working", true, true],
        ])(
            "%s a working selection change when filters apply all at once: %s",
            async (_desc, applyAllAtOnce, isWorkingSelectionChange) => {
                const { dispatch, props } = renderFilterBarProps(await createTester(applyAllAtOnce));

                (props.onDateFilterChanged as OnDateFilterChangedAtRuntime)(
                    granularityDateFilter,
                    "opt",
                    true,
                );

                expect(dispatch).toHaveBeenCalledWith(
                    changeDateFilterSelectionOfAnyType(granularityDateFilter, {
                        dateFilterOptionLocalId: "opt",
                        isWorkingSelectionChange,
                    }),
                );
            },
        );

        it("changes the selection of a date filter of the old type by the old command", async () => {
            const { dispatch, props } = renderFilterBarProps(await createTester());
            const relativeDateFilter = newRelativeDashboardDateFilter("GDC.time.year", -1, -1);

            props.onDateFilterChanged(relativeDateFilter, "opt");

            expect(dispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "GDC.DASH/CMD.FILTER_CONTEXT.DATE_FILTER.CHANGE_SELECTION",
                    payload: expect.objectContaining({
                        type: "relative",
                        granularity: "GDC.time.year",
                        from: -1,
                        to: -1,
                        dateFilterOptionLocalId: "opt",
                    }),
                }),
            );
        });

        it("clears the date filter selection when the filter is removed", async () => {
            const { dispatch, props } = renderFilterBarProps(await createTester());

            props.onDateFilterChanged(undefined);

            expect(dispatch).toHaveBeenCalledWith(clearDateFilterSelection());
        });
    });
});
