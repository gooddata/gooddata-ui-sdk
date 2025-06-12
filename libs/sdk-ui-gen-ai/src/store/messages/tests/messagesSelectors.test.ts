// (C) 2024 GoodData Corporation

import { describe, it, expect } from "vitest";
import { RootState } from "../../types";
import { lastMessageSelector } from "../messagesSelectors";

const dummyState: RootState = {
    messages: {
        messageOrder: ["1", "2"],
        messages: {
            "1": {
                id: 1,
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
                id: 2,
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
};

describe("messagesSelectors", () => {
    describe("lastMessageSelector", () => {
        it("should return the last message", () => {
            const lastMessage = lastMessageSelector(dummyState);

            expect(lastMessage).toBe(dummyState.messages.messages["2"]);
        });
    });
});
