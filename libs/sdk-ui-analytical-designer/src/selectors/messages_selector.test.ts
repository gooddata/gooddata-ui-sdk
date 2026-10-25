// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { initialState } from "../reducers/initial_state.js";
import { messagesInitialState } from "../store/messages/messages_state.js";
import { withAppState } from "../tests/state_builder.test.helpers.js";

import { displayedMessagesSelector } from "./messages_selector.js";

describe("displayedMessagesSelector", () => {
    it("should display no messages in the initial state", () => {
        expect(displayedMessagesSelector(initialState).messages).toEqual([]);
    });

    it("should get displayed messages", () => {
        const message = {
            id: "message-1",
            type: "error",
            text: "messages.saveReportSuccess",
        };

        const messages = [message];

        const withMessage = withAppState(initialState, {
            messages: {
                ...messagesInitialState,
                displayed: messages,
            },
        });

        expect(displayedMessagesSelector(withMessage).messages).toEqual(messages);
    });
});
