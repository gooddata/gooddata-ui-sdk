// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type UnknownAction } from "@reduxjs/toolkit";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { en_US } from "../localization/bundles/en-US.localization-bundle.js";
import {
    removeContextReferenceAction,
    selectedContextReferencesAction,
} from "../store/chatWindow/chatWindowSlice.js";
import { type RootState } from "../store/types.js";
import { type IGenAIContextObject, type SelectedContext } from "../types.js";

import { GenAIChatContextIndicator } from "./GenAIChatContextIndicator.js";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker (useContextItems.test.tsx renders these hooks with the real react-redux), which turns the
// `vi.mock()` below into a no-op. Dropping the module registry from `vi.hoisted()` (it runs before
// this file's own imports, unlike any `beforeEach`) makes those imports resolve through the mocks.
const { dispatch } = vi.hoisted(() => {
    vi.resetModules();
    return { dispatch: vi.fn<(action: UnknownAction) => UnknownAction>() };
});

function makeContext({ withWidget = true }: { withWidget?: boolean } = {}) {
    return {
        view: {
            dashboard: {
                ref: { identifier: "dashboard-1", type: "analyticalDashboard" },
                title: "Revenue Dashboard",
                widgets: [],
            },
        },
        referencedObjects: withWidget
            ? [
                  {
                      objects: [
                          {
                              ref: { identifier: "insight-1", type: "insight" },
                              title: "Sales Chart",
                              type: "WIDGET",
                          },
                      ],
                  },
              ]
            : [],
    } as unknown as IGenAIUserContext;
}

function makeState(
    context: IGenAIUserContext | undefined,
    ambientSelected: SelectedContext = {
        activated: false,
        dashboard: { ref: { identifier: "none" } },
    } as SelectedContext,
): RootState {
    return {
        chatWindow: {
            settings: { enableAiContextSetup: true },
            context: {
                active: context,
                ambient: undefined,
                ambientSelected,
            },
        },
    } as unknown as RootState;
}

let state: RootState = makeState(makeContext());

vi.mock("react-redux", () => ({
    useDispatch: () => dispatch,
    useSelector: (selector: (state: RootState) => unknown) => selector(state),
}));

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

function renderIndicator(context: IGenAIUserContext | undefined = makeContext()) {
    state = makeState(context);

    const wrap = (ui: ReactElement) => (
        <IntlProvider locale="en" messages={messages}>
            {ui}
        </IntlProvider>
    );

    const { rerender } = render(wrap(<GenAIChatContextIndicator />));

    return {
        // Swaps the context the selectors see and re-renders, standing in for a store update.
        setContext: (next: IGenAIUserContext | undefined) => {
            state = makeState(next);
            rerender(wrap(<GenAIChatContextIndicator />));
        },
    };
}

describe("GenAIChatContextIndicator", () => {
    beforeEach(() => {
        dispatch.mockClear();
    });

    it("names every chip delete button after the item it removes", () => {
        renderIndicator();

        expect(
            screen.getByRole("button", { name: "Remove Revenue Dashboard from context" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Remove Sales Chart from context" })).toBeInTheDocument();
    });

    it("exposes the chips as a named group instead of a live region", () => {
        renderIndicator();

        const group = screen.getByRole("group", { name: "Assistant context" });
        expect(group).not.toHaveAttribute("aria-live");
    });

    it("names the type icon of each chip", () => {
        renderIndicator();

        expect(screen.getByRole("img", { name: "Dashboard" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Visualization" })).toBeInTheDocument();
    });

    it("keeps announcing after the last chip is gone", async () => {
        const { setContext } = renderIndicator(makeContext({ withWidget: false }));

        setContext(undefined);

        await waitFor(() =>
            expect(screen.getByRole("status")).toHaveTextContent("The assistant context is now empty."),
        );
    });

    it("shows the open report as a chip that toggles its use without a chooser", () => {
        const report: IGenAIContextObject = {
            id: "q1",
            ref: idRef("q1", "report"),
            title: "Q1 Report",
            nesting: 0,
            type: "report",
            where: "view.report",
        };
        state = makeState(
            { view: { report: { ref: report.ref, title: report.title } } },
            { activated: true, report },
        );

        render(
            <IntlProvider locale="en" messages={messages}>
                <GenAIChatContextIndicator />
            </IntlProvider>,
        );

        expect(screen.getByRole("img", { name: "Report" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { expanded: false })).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Q1 Report"));

        expect(dispatch).toHaveBeenCalledWith(selectedContextReferencesAction({ activated: false, report }));
    });

    it("names the report chip's toggle after what it does", () => {
        const report: IGenAIContextObject = {
            id: "q1",
            ref: idRef("q1", "report"),
            title: "Q1 Report",
            nesting: 0,
            type: "report",
            where: "view.report",
        };
        state = makeState(
            { view: { report: { ref: report.ref, title: report.title } } },
            { activated: true, report },
        );

        render(
            <IntlProvider locale="en" messages={messages}>
                <GenAIChatContextIndicator />
            </IntlProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Stop using this context" }));

        expect(dispatch).toHaveBeenCalledWith(selectedContextReferencesAction({ activated: false, report }));
    });

    it("removes a report other than the open one through its chip", () => {
        const openReport: IGenAIContextObject = {
            id: "q1",
            ref: idRef("q1", "report"),
            title: "Q1 Report",
            nesting: 0,
            type: "report",
            where: "view.report",
        };
        state = makeState(
            { view: { report: { ref: idRef("q2", "report"), title: "Q2 Report" } } },
            { activated: true, report: openReport },
        );

        render(
            <IntlProvider locale="en" messages={messages}>
                <GenAIChatContextIndicator />
            </IntlProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Remove Q2 Report from context" }));

        expect(dispatch).toHaveBeenCalledWith(
            removeContextReferenceAction({
                object: {
                    id: "q2",
                    ref: idRef("q2", "report"),
                    title: "Q2 Report",
                    nesting: 0,
                    type: "report",
                    where: "view.report",
                },
            }),
        );
    });
});
