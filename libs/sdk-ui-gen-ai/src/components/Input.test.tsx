// (C) 2026 GoodData Corporation

import { useEffect } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../store/chatWindow/chatWindowSlice.js";
import {
    loadConversationsSuccessAction,
    messagesSliceName,
    messagesSliceReducer,
} from "../store/messages/messagesSlice.js";

import { Input } from "./Input.js";

const { focus } = vi.hoisted(() => {
    vi.resetModules();
    return { focus: vi.fn() };
});

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    DefaultSyntaxHighlightingInput: function DefaultSyntaxHighlightingInput({
        onApi,
    }: {
        onApi: (api: unknown) => void;
    }) {
        useEffect(() => onApi({ focus }), [onApi]);
        return null;
    },
}));

vi.mock("./GenAIChatContextIndicator.js", () => ({
    GenAIChatContextIndicator: () => createPortal(<input aria-label="Search" />, document.body),
}));

vi.mock("./GenAiChatAgentSwitching.js", () => ({ GenAiChatAgentSwitching: () => null }));

describe("Input", () => {
    it("keeps focus in a portaled context dialog on mousedown", () => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
                [messagesSliceName]: messagesSliceReducer,
            },
            preloadedState: {
                [chatWindowSliceName]: getInitialChatWindowState(),
            },
        });
        store.dispatch(loadConversationsSuccessAction({ conversations: [] }));

        render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={{}} onError={() => {}}>
                    <Input />
                </IntlProvider>
            </Provider>,
        );

        const notPrevented = fireEvent.mouseDown(screen.getByRole("textbox", { name: "Search" }));

        expect(notPrevented).toBe(true);
        expect(focus).not.toHaveBeenCalled();
    });
});
