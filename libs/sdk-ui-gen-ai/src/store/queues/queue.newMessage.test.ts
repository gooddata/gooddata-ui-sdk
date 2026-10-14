// (C) 2026 GoodData Corporation

import { type MiddlewareAPI } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";

import { type IChatConversationLocalItem, makeUserItem } from "../../model.js";
import { filledFormAction, newMessageAction } from "../messages/messagesSlice.js";
import { type RootState } from "../types.js";

import { queueMiddleware } from "./queue.newMessage.js";

const clarificationMessage = (filled = false) =>
    ({
        localId: "clarification",
        role: "assistant",
        filled,
        content: {
            type: "multipart",
            parts: [
                { type: "clarifyingQuestions", questions: [] },
                { type: "text", text: "Details" },
            ],
        },
    }) as IChatConversationLocalItem;

function stateWith(...messages: IChatConversationLocalItem[]): RootState {
    return {
        messages: {
            currentConversation: { localId: "conversation" },
            conversationsData: {
                conversation: {
                    items: Object.fromEntries(messages.map((message) => [message.localId, message])),
                    order: messages.map((message) => message.localId),
                },
            },
        },
    } as unknown as RootState;
}

describe("new message queue middleware", () => {
    it("cancels an unfilled clarification before submitting a new message", () => {
        const dispatch = vi.fn();
        const next = vi.fn();
        const api = {
            getState: () => stateWith(clarificationMessage()),
            dispatch,
        } as unknown as MiddlewareAPI;
        const action = newMessageAction(makeUserItem({ type: "text", text: "New question" }));

        queueMiddleware(api)(next)(action);

        expect(dispatch).toHaveBeenCalledWith(
            filledFormAction({ assistantMessageId: "clarification", responses: null }),
        );
        expect(dispatch.mock.invocationCallOrder[0]).toBeLessThan(next.mock.invocationCallOrder[0]);
        expect(next).toHaveBeenCalledWith(action);
    });

    it("preserves a clarification form transition dispatched before its follow-up message", () => {
        const dispatch = vi.fn();
        const next = vi.fn();
        const api = {
            getState: () => stateWith(clarificationMessage(true)),
            dispatch,
        } as unknown as MiddlewareAPI;
        const action = newMessageAction(makeUserItem({ type: "text", text: "**Which region?**\n\nEast" }));

        queueMiddleware(api)(next)(action);

        expect(dispatch).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(action);
    });

    it("cancels a pending clarification followed by another assistant message", () => {
        const dispatch = vi.fn();
        const next = vi.fn();
        const laterAssistantMessage = {
            localId: "later-assistant-message",
            role: "assistant",
            content: { type: "text", text: "More details" },
        } as IChatConversationLocalItem;
        const api = {
            getState: () => stateWith(clarificationMessage(), laterAssistantMessage),
            dispatch,
        } as unknown as MiddlewareAPI;
        const action = newMessageAction(makeUserItem({ type: "text", text: "New question" }));

        queueMiddleware(api)(next)(action);

        expect(dispatch).toHaveBeenCalledWith(
            filledFormAction({ assistantMessageId: "clarification", responses: null }),
        );
        expect(next).toHaveBeenCalledWith(action);
    });
});
