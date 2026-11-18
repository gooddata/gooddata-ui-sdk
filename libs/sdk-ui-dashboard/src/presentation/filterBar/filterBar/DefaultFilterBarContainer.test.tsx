// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type DashboardEventHandler } from "../../../model/eventHandlers/eventHandler.js";
import { DashboardEventsProvider } from "../../../model/react/DashboardEventsContext.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectNamesOfFiltersWithInvalidSelection } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { createInternalIntl } from "../../localization/createInternalIntl.js";

import { DefaultFilterBarContainer } from "./DefaultFilterBarContainer.js";
import { useResetFiltersButton } from "./hooks/useResetFiltersButton.js";
import { ResetFiltersButton } from "./ResetFiltersButton.js";

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn(),
    useDashboardDispatch: () => vi.fn(),
}));
vi.mock("../../localization/IntlWrapper.js", () => ({
    IntlWrapper: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock("./hooks/useFilterBarState.js", () => ({
    useFilterBarState: () => ({
        rows: [],
        height: 40,
        isFilterBarExpanded: false,
        scrollable: false,
        setFilterBarExpanded: vi.fn(),
        setCalculatedRows: vi.fn(),
    }),
}));
vi.mock("./hooks/useFilterExpansionByDragAndDrop.js", () => ({
    useFilterExpansionByDragAndDrop: () => undefined,
}));
vi.mock("./hooks/useRowsCalculator.js", () => ({
    useRowsCalculator: () => () => ({}),
}));
vi.mock("./useExecutionTimestampMessage.js", () => ({
    useExecutionTimestampMessage: () => ({ showExecutionTimestampMessage: false }),
}));
vi.mock("./filterViews/FilterViews.js", () => ({
    FilterViews: () => <button type="button">My views</button>,
}));
vi.mock("./ShowAllFiltersButton.js", () => ({
    ShowAllFiltersButton: () => null,
}));
vi.mock("./hooks/useResetFiltersButton.js", () => ({
    useResetFiltersButton: vi.fn(),
}));

describe("DefaultFilterBarContainer", () => {
    let handlers: DashboardEventHandler[];

    beforeEach(() => {
        handlers = [];
        vi.mocked(useDashboardSelector).mockImplementation((selector: unknown) =>
            selector === selectNamesOfFiltersWithInvalidSelection ? [] : false,
        );
        vi.mocked(useResetFiltersButton).mockReturnValue({
            canReset: true,
            resetType: "all",
            resetFilters: vi.fn(),
        });
    });

    function renderContainer() {
        return render(
            <RawIntlProvider value={createInternalIntl()}>
                <DashboardEventsProvider
                    registerHandler={(handler) => handlers.push(handler)}
                    unregisterHandler={(handler) => {
                        handlers = handlers.filter((h) => h !== handler);
                    }}
                >
                    <DefaultFilterBarContainer>
                        <button type="button">Date range</button>
                        <button type="button">Region</button>
                        <ResetFiltersButton />
                    </DefaultFilterBarContainer>
                </DashboardEventsProvider>
            </RawIntlProvider>,
        );
    }

    function emitApplied() {
        const event = { type: "GDC.DASH/EVT.FILTER_CONTEXT.WORKING_SELECTION.APPLIED" } as any;
        act(() => {
            handlers.filter((h) => h.eval(event)).forEach((h) => h.handler(event, vi.fn() as any, {} as any));
        });
    }

    it("enters the filters on Tab after apply and leaves the bar without an extra reset stop", async () => {
        renderContainer();
        const user = userEvent.setup();

        emitApplied();
        expect(screen.getByRole("region")).toHaveFocus();

        await user.tab();
        expect(screen.getByRole("button", { name: "Date range" })).toHaveFocus();

        await user.tab();
        expect(screen.getByRole("button", { name: "My views" })).toHaveFocus();

        // Shift+Tab re-enters the bar at the last filter, not at the reset button
        await user.tab({ shift: true });
        expect(screen.getByRole("button", { name: "Region" })).toHaveFocus();
    });

    it("reaches the reset button with the arrow keys", async () => {
        renderContainer();
        const user = userEvent.setup();

        emitApplied();
        await user.tab();
        expect(screen.getByRole("button", { name: "Date range" })).toHaveFocus();

        await user.keyboard("{ArrowRight}{ArrowRight}");
        expect(screen.getByRole("button", { name: "Reset all to defaults" })).toHaveFocus();
    });
});
