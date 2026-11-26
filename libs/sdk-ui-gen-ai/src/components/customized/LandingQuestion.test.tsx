// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { chatWindowSliceReducer } from "../../store/chatWindow/chatWindowSlice.js";
import { conversationMessagesSelector, refocusSelector } from "../../store/messages/messagesSelectors.js";
import {
    messagesSliceReducer,
    setAgentsAction,
    startNewConversationAction,
} from "../../store/messages/messagesSlice.js";

import { DefaultLandingQuestion } from "./LandingQuestion.js";

function createStore() {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
    });
    store.dispatch(setAgentsAction({ agents: [{ id: "agent", title: "Agent" }] }));
    // the landing screen is shown for a new, empty conversation
    store.dispatch(startNewConversationAction());
    return store;
}

describe("DefaultLandingQuestion", () => {
    it("sends the question and asks the chat input to take focus", () => {
        const store = createStore();

        render(
            <Provider store={store}>
                <IntlWrapper>
                    <DefaultLandingQuestion question="What is new?" answer="Plenty." />
                </IntlWrapper>
            </Provider>,
        );

        const refocusBefore = refocusSelector(store.getState());

        fireEvent.click(screen.getByRole("button", { name: "What is new?" }));

        expect(conversationMessagesSelector(store.getState())).toHaveLength(2);
        // the landing screen with this button unmounts, so focus must move to the input
        expect(refocusSelector(store.getState())).toBe(refocusBefore + 1);
    });
});
