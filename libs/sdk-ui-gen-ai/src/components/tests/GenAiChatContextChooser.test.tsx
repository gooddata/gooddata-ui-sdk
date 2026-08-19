// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { type IGenAIUserContext, idRef } from "@gooddata/sdk-model";

import { chatWindowSliceName } from "../../store/chatWindow/chatWindowSlice.js";
import { GenAiChatContextChooser } from "../GenAiChatContextChooser.js";

const messages = {
    "gd.gen-ai.context.add_context": "Add context",
    "gd.gen-ai.context.untitled": "Untitled",
};

const ambient: IGenAIUserContext = {
    view: {
        dashboard: {
            ref: idRef("ambient-dashboard", "analyticalDashboard"),
            title: "Revenue",
            widgets: [],
        },
    },
};

function renderChooser({ search = "" }: { search?: string } = {}) {
    const completeAndEmpty = {
        items: [],
        loadedPages: 1,
        hasNextPage: false,
        isLoading: false,
        isExternal: false,
    };
    const storeState = {
        [chatWindowSliceName]: {
            context: {
                ambient,
                active: {
                    referencedObjects: [
                        {
                            objects: [
                                {
                                    ref: idRef("ambient-dashboard", "analyticalDashboard"),
                                    title: "Revenue",
                                    type: "DASHBOARD",
                                },
                            ],
                        },
                    ],
                },
            },
            contextObjects: { dashboard: completeAndEmpty, visualization: completeAndEmpty },
            contextObjectsSearch: search,
        },
    };
    const store = {
        getState: () => storeState,
        subscribe: () => () => {},
        dispatch: vi.fn(),
    };

    render(
        <Provider store={store as never}>
            <IntlProvider locale="en-US" messages={messages}>
                <GenAiChatContextChooser />
            </IntlProvider>
        </Provider>,
    );

    return screen.getByTestId("choose_context");
}

describe("GenAiChatContextChooser", () => {
    it("disables the button when the workspace has nothing left to offer", () => {
        expect(renderChooser()).toBeDisabled();
    });

    it("keeps the button open when it is the search that left the list empty", () => {
        expect(renderChooser({ search: "revenue" })).not.toBeDisabled();
    });
});
