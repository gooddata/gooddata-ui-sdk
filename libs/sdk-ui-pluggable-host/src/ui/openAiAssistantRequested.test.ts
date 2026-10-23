// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    PluggableAppEventType,
    isOpenAiAssistantRequestedEvent,
    openAiAssistantRequested,
} from "@gooddata/sdk-pluggable-application-model";

describe("openAiAssistantRequested", () => {
    it("preserves an explicit conversation ID", () => {
        const event = openAiAssistantRequested({ conversationId: "conversation-1" });

        expect(event.payload).toEqual({ conversationId: "conversation-1" });
        expect(isOpenAiAssistantRequestedEvent(event)).toBe(true);
    });

    it("keeps plain open requests backward compatible", () => {
        expect(openAiAssistantRequested().payload).toEqual({});
        expect(isOpenAiAssistantRequestedEvent(openAiAssistantRequested())).toBe(true);
    });
});

describe("isOpenAiAssistantRequestedEvent", () => {
    it.each([undefined, "conversation-1", ""])("accepts conversationId %j", (conversationId) => {
        expect(
            isOpenAiAssistantRequestedEvent({
                type: PluggableAppEventType.AI_ASSISTANT_OPEN_REQUESTED,
                payload: { conversationId },
            }),
        ).toBe(true);
    });

    it.each([null, 42, false, [], {}].map((conversationId) => ({ conversationId })))(
        "rejects conversationId $conversationId",
        ({ conversationId }) => {
            expect(
                isOpenAiAssistantRequestedEvent({
                    type: PluggableAppEventType.AI_ASSISTANT_OPEN_REQUESTED,
                    payload: { conversationId },
                }),
            ).toBe(false);
        },
    );

    it.each([null, undefined, [], { question: 42 }, { userContext: null }].map((payload) => ({ payload })))(
        "still rejects malformed payload $payload",
        ({ payload }) => {
            expect(
                isOpenAiAssistantRequestedEvent({
                    type: PluggableAppEventType.AI_ASSISTANT_OPEN_REQUESTED,
                    payload,
                }),
            ).toBe(false);
        },
    );
});
