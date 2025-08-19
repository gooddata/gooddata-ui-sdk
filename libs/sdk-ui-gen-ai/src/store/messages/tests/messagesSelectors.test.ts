// (C) 2024-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { RootState } from "../../types.js";
import { lastMessageSelector } from "../messagesSelectors.js";

const dummyState: RootState = {
    messages: {
        messageOrder: ["1", "2"],
        messages: {
            "1": {
                id: "1",
                localId: "1",
                created: Date.now(),
                role: "user",
                cancelled: false,
                complete: true,
                content: [
                    {
                        type: "text",
                        text: "Hello",
                    },
                ],
            },
            "2": {
                id: "2",
                localId: "2",
                created: Date.now() + 1000,
                role: "assistant",
                complete: true,
                cancelled: true,
                content: [
                    {
                        type: "text",
                        text: "Hi there!",
                    },
                ],
            },
        },
        verbose: false,
    },
} as unknown as RootState;

describe("messagesSelectors", () => {
    describe("lastMessageSelector", () => {
        it("should return the last message", () => {
            const lastMessage = lastMessageSelector(dummyState);

            expect(lastMessage).toBe(dummyState.messages.messages["2"]);
        });
    });
});
