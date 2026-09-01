// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IGenAIUserContext } from "@gooddata/sdk-model";

import { type RootState } from "../store/types.js";

const state = {
    chatWindow: {
        settings: { enableAiContextSetup: true },
        context: {
            active: undefined,
            ambient: {
                view: {
                    dashboard: {
                        ref: { identifier: "dashboard-1", type: "analyticalDashboard" },
                        title: "Revenue Dashboard",
                        widgets: [],
                    },
                },
            } as unknown as IGenAIUserContext,
        },
    },
} as unknown as RootState;

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker (useContextItems.test.tsx renders these hooks with the real react-redux), which turns the
// `vi.mock()` below into a no-op. Dropping the module registry from `vi.hoisted()` (it runs before
// this file's own imports, unlike any `beforeEach`) makes those imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("react-redux", () => ({
    useDispatch: () => vi.fn(),
    useSelector: (selector: (state: RootState) => unknown) => selector(state),
}));

vi.mock("./hooks/useContextItems.js", () => ({
    useUserContextItems: () => ({
        items: [
            {
                id: "insight-1",
                ref: { identifier: "insight-1", type: "insight" },
                title: "Sales Chart",
                nesting: 1,
                type: "widget",
                where: "referencedObjects",
            },
        ],
        isLoading: false,
        hasNextPage: false,
        loadNextPage: vi.fn(),
    }),
}));

import { en_US } from "../localization/bundles/en-US.localization-bundle.js";

import { GenAiChatContextChooser } from "./GenAiChatContextChooser.js";

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

describe("GenAiChatContextChooser", () => {
    it("advertises the popup as a dialog on the trigger button", () => {
        render(
            <IntlProvider locale="en" messages={messages}>
                <GenAiChatContextChooser />
            </IntlProvider>,
        );

        expect(screen.getByRole("button", { name: "Add context" })).toHaveAttribute(
            "aria-haspopup",
            "dialog",
        );
    });
});
