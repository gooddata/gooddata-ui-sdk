// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import type { IChatKdaDefinition, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { newAttribute, newMeasure } from "@gooddata/sdk-model";

import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";

import { ConversationKdaContent } from "./ConversationKdaContent.js";

vi.mock("./useKdaDefinition.js", () => ({
    useKdaDefinition: () => ({}),
    useKdaInfo: () => ({ range: "January", title: "Revenue" }),
}));

vi.mock("../contents/Markdown.js", () => ({
    MarkdownComponent: ({ children }: { children: ReactNode }) => children,
}));

const kda: IChatKdaDefinition = {
    measure: newMeasure("revenue"),
    dateAttribute: newAttribute("date.month"),
    dateGranularity: "GDC.time.month",
    filters: [],
    referencePeriod: "2025-01",
    analyzedPeriod: "2025-02",
};

const messages = {
    "gd.gen-ai.changeAnalysis.splitter": " – ",
    "gd.gen-ai.kda.default_message": "Change in {title} during {range}",
    "gd.gen-ai.changeAnalysis.explain_the_change": "Explain the change",
};

function renderComponent(
    isKeyDriverAnalysisMounted: boolean,
    enableKeyDriverAnalysis?: boolean,
    enableChangeAnalysis = true,
) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
        preloadedState: {
            [chatWindowSliceName]: {
                ...getInitialChatWindowState(),
                isKeyDriverAnalysisMounted,
                settings: { enableChangeAnalysis } as IUserWorkspaceSettings,
            },
        },
    });

    return render(
        <Provider store={store}>
            <IntlProvider locale="en-US" messages={messages}>
                <ConversationKdaContent kda={kda} enableKeyDriverAnalysis={enableKeyDriverAnalysis} />
            </IntlProvider>
        </Provider>,
    );
}

describe("ConversationKdaContent", () => {
    it("should not render when Key Driver Analysis is not mounted", () => {
        renderComponent(false);

        expect(screen.queryByText("Explain the change")).not.toBeInTheDocument();
    });

    it("should render when Key Driver Analysis is mounted", () => {
        renderComponent(true);

        expect(screen.getByText("Explain the change")).toBeInTheDocument();
    });

    it("should not render when enableKeyDriverAnalysis is false", () => {
        renderComponent(true, false);

        expect(screen.queryByText("Explain the change")).not.toBeInTheDocument();
    });

    it("should render when enableKeyDriverAnalysis is true and the workspace setting is disabled", () => {
        renderComponent(true, true, false);

        expect(screen.getByText("Explain the change")).toBeInTheDocument();
    });
});
