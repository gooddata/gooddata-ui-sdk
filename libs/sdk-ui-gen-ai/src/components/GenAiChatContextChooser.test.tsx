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

vi.mock("react-redux", () => ({
    useDispatch: () => vi.fn(),
    useSelector: (selector: (state: RootState) => unknown) => selector(state),
}));

vi.mock("./hooks/useContextItems.js", () => ({
    useContextItems: () => ({
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
