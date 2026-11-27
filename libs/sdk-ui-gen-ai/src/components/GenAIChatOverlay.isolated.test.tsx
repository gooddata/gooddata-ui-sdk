// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

const wrapperState = vi.hoisted(() => ({ renderInput: true }));

vi.mock("./GenAIChatHeader.js", () => ({
    GenAIChatHeader: () => <button type="button" aria-label="Recent conversations" />,
}));
vi.mock("./GenAIChatConversations.js", () => ({ GenAIChatConversations: () => null }));
// The real input focuses itself (useInputAutofocus) unless it declines to (e.g. a pending clarifying
// question); the stub never does, so only the Dialog's own focus handling is observed here.
vi.mock("./GenAIChatWrapper.js", async () => {
    const { REPLY_BOX_ID } = await import("./constants.js");
    return {
        GenAIChatWrapper: () =>
            wrapperState.renderInput ? (
                <div id={REPLY_BOX_ID}>
                    <div
                        role="textbox"
                        tabIndex={0}
                        aria-label="Ask your question. Type @ for suggestions."
                    />
                </div>
            ) : null,
    };
});

const { en_US } = await import("../localization/bundles/en-US.localization-bundle.js");
const { chatWindowSliceReducer } = await import("../store/chatWindow/chatWindowSlice.js");
const { messagesSliceReducer } = await import("../store/messages/messagesSlice.js");
const { GenAIChatOverlay } = await import("./GenAIChatOverlay.js");

const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

function renderOverlay() {
    const store = configureStore({
        reducer: { chatWindow: chatWindowSliceReducer, messages: messagesSliceReducer },
    });
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    {children}
                </IntlProvider>
            </Provider>
        );
    }

    return render(<GenAIChatOverlay onClose={vi.fn()} />, { wrapper: Wrapper });
}

afterAll(() => {
    vi.resetModules();
});

afterEach(() => {
    cleanup();
    wrapperState.renderInput = true;
});

describe("GenAIChatOverlay", () => {
    it("moves focus straight to the chat input on open, without stopping on the first focusable", async () => {
        renderOverlay();

        const recentConversations = await screen.findByRole("button", { name: "Recent conversations" });
        const onFocus = vi.fn();
        recentConversations.addEventListener("focus", onFocus);

        const input = screen.getByRole("textbox", { name: "Ask your question. Type @ for suggestions." });
        await waitFor(() => expect(document.activeElement).toBe(input));
        expect(onFocus).not.toHaveBeenCalled();
    });

    it("moves focus into the dialog when the chat input is not rendered", async () => {
        wrapperState.renderInput = false;
        renderOverlay();

        const recentConversations = await screen.findByRole("button", { name: "Recent conversations" });

        await waitFor(() => expect(document.activeElement).toBe(recentConversations));
    });
});
