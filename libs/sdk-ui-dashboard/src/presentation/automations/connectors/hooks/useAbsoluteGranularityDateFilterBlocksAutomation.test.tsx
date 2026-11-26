// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { type Store } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDashboardTab, switchDashboardTab } from "../../../../model/commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../../model/DashboardTester.js";
import { ReactDashboardContext } from "../../../../model/react/DashboardStoreProvider.js";
import { tabsActions } from "../../../../model/store/tabs/index.js";
import { selectActiveTabLocalIdentifier } from "../../../../model/store/tabs/tabsSelectors.js";
import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";

import { useAbsoluteGranularityDateFilterBlocksAutomation } from "./useAbsoluteGranularityDateFilterBlocksAutomation.js";

describe("useAbsoluteGranularityDateFilterBlocksAutomation", () => {
    let Tester: DashboardTester;
    let otherTabLocalIdentifier: string;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);

        const activeTabLocalIdentifier = Tester.select(selectActiveTabLocalIdentifier)!;
        await Tester.dispatchAndWaitFor(createDashboardTab("Tab 2"), "GDC.DASH/EVT.TAB.SWITCHED");
        otherTabLocalIdentifier = Tester.select(selectActiveTabLocalIdentifier)!;
        await Tester.dispatchAndWaitFor(
            switchDashboardTab(activeTabLocalIdentifier),
            "GDC.DASH/EVT.TAB.SWITCHED",
        );
    });

    function upsertGranularityDateFilter(tabLocalIdentifier?: string) {
        Tester.dispatch(
            tabsActions.upsertDateFilter({
                type: "absoluteGranularity",
                granularity: "GDC.time.year",
                from: "2025",
                to: "2026",
                tabLocalIdentifier,
            }),
        );
    }

    function renderBlocksAutomation(isDashboardExport: boolean) {
        const store = {
            getState: () => Tester.state(),
            subscribe: () => () => {},
            dispatch: vi.fn(),
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
        return renderHook(() => useAbsoluteGranularityDateFilterBlocksAutomation(isDashboardExport), {
            wrapper,
        }).result.current;
    }

    it.each([false, true])(
        "does not block without the new type (dashboard export: %s)",
        (isDashboardExport) => {
            expect(renderBlocksAutomation(isDashboardExport)).toBe(false);
        },
    );

    it.each([false, true])(
        "blocks with the new type on the active tab (dashboard export: %s)",
        (isDashboardExport) => {
            upsertGranularityDateFilter();

            expect(renderBlocksAutomation(isDashboardExport)).toBe(true);
        },
    );

    it("blocks a dashboard export with the new type on another tab", () => {
        upsertGranularityDateFilter(otherTabLocalIdentifier);

        expect(renderBlocksAutomation(true)).toBe(true);
    });

    it("does not block a widget automation with the new type on another tab only", () => {
        upsertGranularityDateFilter(otherTabLocalIdentifier);

        expect(renderBlocksAutomation(false)).toBe(false);
    });
});
