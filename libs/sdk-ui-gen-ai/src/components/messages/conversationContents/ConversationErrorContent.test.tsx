// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { WorkspaceProvider } from "@gooddata/sdk-ui";

import enUsMessages from "../../../localization/bundles/en-US.json" with { type: "json" };
import { chatWindowSliceName, chatWindowSliceReducer } from "../../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceName, messagesSliceReducer } from "../../../store/messages/messagesSlice.js";

import { ConversationErrorContent, type ConversationErrorContentProps } from "./ConversationErrorContent.js";

const messages = Object.fromEntries(Object.entries(enUsMessages).map(([id, value]) => [id, value.text]));

function renderErrorContent({
    message = "Unknown error",
    code,
    reason,
    traceId,
}: {
    message?: string;
    code?: number;
    reason?: ConversationErrorContentProps["reason"];
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
                <IntlProvider locale="en-US" messages={messages}>
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
    it.each([{ code: 401 }, { reason: "NOT_AUTHENTICATED" }, { code: 401, reason: "NOT_AUTHENTICATED" }])(
        "renders a sign-in message for $code / $reason",
        (error) => {
            renderErrorContent({ message: "Raw authentication failure", ...error });

            expect(screen.getByRole("alert")).toHaveTextContent(
                "You're not signed in. Please sign in again to continue.",
            );
            expect(screen.queryByText("Raw authentication failure")).not.toBeInTheDocument();
        },
    );

    it.each(["Forbidden", "You no longer have access to this agent. Please start a new conversation."])(
        "offers conversation recovery for a 403 error: %s",
        (message) => {
            renderErrorContent({ code: 403, message });

            expect(screen.getByRole("alert")).toHaveTextContent(
                "You don't have permission to access this content. Start a new conversation or contact your administrator if you need access.",
            );
            expect(screen.queryByText(/sign in again/i)).not.toBeInTheDocument();
        },
    );

    it("suggests starting a new conversation for 404 errors without assuming an expired session", () => {
        renderErrorContent({ code: 404, message: "Not found" });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "The requested result or conversation is no longer available. Start a new conversation and try again.",
        );
        expect(screen.queryByText(/sign in|session|cache/i)).not.toBeInTheDocument();
    });

    it("suggests sending the question again for an empty response", () => {
        renderErrorContent({ reason: "EMPTY_RESPONSE", message: "Raw empty response failure" });

        expect(screen.getByRole("alert")).toHaveTextContent(
            "The assistant returned no response. Please send your question again.",
        );
        expect(screen.queryByText("Raw empty response failure")).not.toBeInTheDocument();
    });

    it.each([
        { reason: "METADATA_SYNC_IN_PROGRESS", text: "Still setting up — try again shortly." },
        { reason: "METADATA_SYNC_REQUEST_ERROR", text: "Syncing failed. Please try again later." },
        { reason: "MODEL_NOT_COMPATIBLE", text: "Model not compatible" },
        {
            reason: "SERVICE_UNAVAILABLE",
            text: "The AI service is temporarily unavailable. Please try again later.",
        },
    ])("preserves $reason rendering priority over a 403 status", ({ reason, text }) => {
        renderErrorContent({ code: 403, reason });

        expect(screen.getByText(text)).toBeInTheDocument();
        expect(screen.queryByText(/don't have permission/)).not.toBeInTheDocument();
    });

    it.each([
        { code: 401 },
        { code: 403 },
        { code: 404 },
        { reason: "NOT_AUTHENTICATED" },
        { reason: "EMPTY_RESPONSE" },
    ])("keeps raw diagnostics available for $code / $reason", (error) => {
        renderErrorContent({ message: "Raw diagnostic message", traceId: "test-trace-id", ...error });

        expect(screen.queryByText(/Raw diagnostic message/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Show more" }));

        expect(screen.getByText(/Raw diagnostic message/)).toBeInTheDocument();
        expect(screen.getByText(/test-trace-id/)).toBeInTheDocument();
        expect(JSON.parse(screen.getByText(/Raw diagnostic message/).textContent ?? "")).toEqual({
            message: "Raw diagnostic message",
            status: error.code,
        });
        fireEvent.click(screen.getByRole("button", { name: "Show less" }));
        expect(screen.queryByText(/Raw diagnostic message/)).not.toBeInTheDocument();
    });

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

        expect(screen.getByRole("alert")).toHaveTextContent("Some arbitrary failure");
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
