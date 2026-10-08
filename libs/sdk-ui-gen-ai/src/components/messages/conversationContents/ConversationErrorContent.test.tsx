// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { DEFAULT_MESSAGES } from "../../../localization/translations.js";
import { chatWindowSliceName, chatWindowSliceReducer } from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";

import { ConversationErrorContent } from "./ConversationErrorContent.js";

function renderErrorContent({
    message = "Unknown error",
    code,
    reason,
    traceId,
}: {
    message?: string;
    code?: number;
    reason?: any;
    traceId?: string;
}) {
    const store = configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
    });

    return render(
        <Provider store={store}>
            <WorkspaceProvider workspace="test-workspace">
                <IntlProvider locale="en-US" messages={DEFAULT_MESSAGES["en-US"]}>
                    <ConversationErrorContent
                        message={message}
                        code={code}
                        reason={reason}
                        traceId={traceId}
                    />
                </IntlProvider>
            </WorkspaceProvider>
        </Provider>,
    );
}

describe("ConversationErrorContent", () => {
    it("renders friendly service unavailable message when code is 503", () => {
        renderErrorContent({
            message: "Unknown error",
            code: 503,
            traceId: "test-trace-id",
        });

        expect(
            screen.getByText("The AI service is temporarily unavailable. Please try again later."),
        ).toBeInTheDocument();
    });

    it("renders friendly service unavailable message when reason is SERVICE_UNAVAILABLE", () => {
        renderErrorContent({
            message: "Custom error message",
            reason: "SERVICE_UNAVAILABLE",
        });

        expect(
            screen.getByText("The AI service is temporarily unavailable. Please try again later."),
        ).toBeInTheDocument();
    });

    it("renders metadata sync in progress error", () => {
        renderErrorContent({
            reason: "METADATA_SYNC_IN_PROGRESS",
        });

        expect(screen.getByText("Still setting up — try again shortly.")).toBeInTheDocument();
    });

    it("renders metadata sync failed error", () => {
        renderErrorContent({
            reason: "METADATA_SYNC_REQUEST_ERROR",
        });

        expect(screen.getByText("Syncing failed. Please try again later.")).toBeInTheDocument();
    });

    it("renders raw message when not a recognized special code or reason", () => {
        renderErrorContent({
            message: "Some arbitrary failure",
            code: 400,
        });

        expect(screen.getByText("Some arbitrary failure")).toBeInTheDocument();
    });

    it("shows trace ID and raw details when expanding Show more", () => {
        renderErrorContent({
            message: "Unknown error",
            code: 503,
            traceId: "a7238de8211d0acc6f9118de49eed701",
        });

        const showMoreButton = screen.getByRole("button", { name: "Show more" });
        fireEvent.click(showMoreButton);

        expect(screen.getByText(/a7238de8211d0acc6f9118de49eed701/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
    });
});
