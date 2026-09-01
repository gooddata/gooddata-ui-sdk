// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IGenAIUserContext } from "@gooddata/sdk-model";

import { en_US } from "../localization/bundles/en-US.localization-bundle.js";
import { type RootState } from "../store/types.js";

import { GenAIChatContextIndicator } from "./GenAIChatContextIndicator.js";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker (useContextItems.test.tsx renders these hooks with the real react-redux), which turns the
// `vi.mock()` below into a no-op. Dropping the module registry from `vi.hoisted()` (it runs before
// this file's own imports, unlike any `beforeEach`) makes those imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
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

function makeState(context: IGenAIUserContext | undefined): RootState {
    return {
        chatWindow: {
            settings: { enableAiContextSetup: true },
            context: {
                active: context,
                ambient: undefined,
                ambientSelected: { activated: false, dashboard: { ref: { identifier: "none" } } } as any,
            },
        },
    } as unknown as RootState;
}

let state: RootState = makeState(makeContext());

vi.mock("react-redux", () => ({
    useDispatch: () => vi.fn(),
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
});
