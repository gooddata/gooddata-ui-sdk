// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { GOODSTRAP_SCROLLED_EVENT } from "@gooddata/sdk-ui-kit";

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

import { type CustomizationContext, customizationContext } from "./CustomizationContext.js";
import { Messages } from "./Messages.js";

const components = {
    LandingScreenComponent: () => null,
    UserMessageComponent: () => null,
    AssistantMessageComponent: () => null,
} as unknown as CustomizationContext["components"];

describe("Messages", () => {
    it("tells open popups that the chat scrolled", () => {
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
        const { container } = render(
            <Provider store={store}>
                <IntlProvider locale="en" messages={{}} onError={() => {}}>
                    <customizationContext.Provider value={{ slots: {}, components }}>
                        <Messages />
                    </customizationContext.Provider>
                </IntlProvider>
            </Provider>,
        );
        const scroller = container.querySelector(".gd-gen-ai-chat__messages")!;
        const onScrolled = vi.fn();
        window.addEventListener(GOODSTRAP_SCROLLED_EVENT, onScrolled);

        fireEvent.scroll(scroller);

        window.removeEventListener(GOODSTRAP_SCROLLED_EVENT, onScrolled);
        expect(onScrolled).toHaveBeenCalledWith(expect.objectContaining({ target: scroller }));
    });
});
