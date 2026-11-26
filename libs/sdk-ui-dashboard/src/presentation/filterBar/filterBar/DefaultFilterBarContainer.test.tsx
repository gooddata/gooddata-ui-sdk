// (C) 2026 GoodData Corporation

import { type ReactNode, useState } from "react";

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
import { useFilterBarState } from "./hooks/useFilterBarState.js";
import { useResetFiltersButton } from "./hooks/useResetFiltersButton.js";
import { ResetFiltersButton } from "./ResetFiltersButton.js";
import { ShowAllFiltersButton } from "./ShowAllFiltersButton.js";

// `isolate: false` shares one module graph per worker; drop it so the imports below resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn(),
    useDashboardDispatch: () => vi.fn(),
}));
vi.mock("../../localization/IntlWrapper.js", () => ({
    IntlWrapper: ({ children }: { children?: ReactNode }) => children,
}));
vi.mock("./hooks/useFilterBarState.js", () => ({
    useFilterBarState: vi.fn(),
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
    ShowAllFiltersButton: vi.fn(() => null),
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
        vi.mocked(useFilterBarState).mockReturnValue({
            rows: [],
            height: 40,
            isFilterBarExpanded: false,
            scrollable: false,
            setFilterBarExpanded: vi.fn(),
            setCalculatedRows: vi.fn(),
        } as unknown as ReturnType<typeof useFilterBarState>);
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

    it("exposes the Show all toggle as a collapsed Tab stop after the auto-expanded filters", async () => {
        const actual = await vi.importActual<{ ShowAllFiltersButton: typeof ShowAllFiltersButton }>(
            "./ShowAllFiltersButton.js",
        );
        vi.mocked(ShowAllFiltersButton).mockImplementation(actual.ShowAllFiltersButton);
        vi.mocked(useFilterBarState).mockImplementation(function useStatefulFilterBarState() {
            const [isFilterBarExpanded, setFilterBarExpanded] = useState(false);
            return {
                rows: [40, 40],
                height: 40,
                isFilterBarExpanded,
                scrollable: false,
                setFilterBarExpanded,
                setCalculatedRows: vi.fn(),
            } as unknown as ReturnType<typeof useFilterBarState>;
        });

        renderContainer();
        const user = userEvent.setup();

        // Tab into the filters auto-expands the bar
        await user.tab();
        expect(screen.getByRole("button", { name: "Date range" })).toHaveFocus();
        expect(screen.getByRole("region")).toHaveAccessibleName(/auto-expanded/);

        await user.tab();
        expect(screen.getByRole("button", { name: "My views" })).toHaveFocus();

        // Leaving the filters for the toggle collapses the auto-expanded bar
        await user.tab();
        const toggle = screen.getByRole("button", { name: "Show all" });
        expect(toggle).toHaveFocus();
        expect(toggle).toHaveAttribute("aria-expanded", "false");

        await user.keyboard("{Enter}");
        expect(screen.getByRole("button", { name: "Show less" })).toBe(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(toggle).toHaveFocus();

        // A manually expanded bar stays expanded while focus moves through the filters
        await user.tab({ shift: true });
        await user.tab({ shift: true });
        expect(toggle).toHaveAttribute("aria-expanded", "true");

        await user.tab();
        await user.tab();
        expect(toggle).toHaveFocus();
        await user.keyboard(" ");
        expect(screen.getByRole("button", { name: "Show all" })).toBe(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(toggle).toHaveFocus();
    });

    it("does not announce a manual collapse as an auto-collapse", async () => {
        const actual = await vi.importActual<{ ShowAllFiltersButton: typeof ShowAllFiltersButton }>(
            "./ShowAllFiltersButton.js",
        );
        vi.mocked(ShowAllFiltersButton).mockImplementation(actual.ShowAllFiltersButton);
        vi.mocked(useFilterBarState).mockImplementation(function useStatefulFilterBarState() {
            const [isFilterBarExpanded, setFilterBarExpanded] = useState(false);
            return {
                rows: [40, 40],
                height: 40,
                isFilterBarExpanded,
                scrollable: false,
                setFilterBarExpanded,
                setCalculatedRows: vi.fn(),
            } as unknown as ReturnType<typeof useFilterBarState>;
        });

        renderContainer();
        const user = userEvent.setup();

        await user.tab();
        await user.tab();
        // Leaving the auto-expanded filters for the toggle is announced as an auto-collapse
        await user.tab();
        expect(screen.getByRole("alert")).toHaveTextContent(/auto-collapsed/);

        await user.keyboard("{Enter}");
        await user.keyboard("{Enter}");
        expect(screen.getByRole("button", { name: "Show all" })).toHaveFocus();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
});
