// (C) 2024 GoodData Corporation

import { describe, it, expect } from "vitest";
import { RootState } from "../../types";
import { lastMessageSelector } from "../messagesSelectors";

const dummyState: RootState = {
    messages: {
        messageOrder: ["1", "2"],
        messages: {
            "1": {
                id: "1",
                created: Date.now(),
                type: "user-text",
                content: {
                    cancelled: false,
                    text: "Hello",
                },
            },
            "2": {
                id: "2",
                created: Date.now() + 1000,
                type: "assistant-text",
                content: { text: "Hi!" },
            },
        },
        verbose: false,
    },
    agent: {
        busy: false,
    },
};

describe("messagesSelectors", () => {
    describe("lastMessageSelector", () => {
        it("should return the last message", () => {
            const lastMessage = lastMessageSelector(dummyState);

            expect(lastMessage).toBe(dummyState.messages.messages["2"]);
        });
    });
});
