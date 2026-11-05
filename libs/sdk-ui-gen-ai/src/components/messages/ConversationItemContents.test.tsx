// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import {
    type GenAIAgent,
    type IChatConversationLocalItem,
    makeAssistantItem,
    makeConversationItem,
    makeUserItem,
} from "../../model.js";
import { chatWindowSliceReducer } from "../../store/chatWindow/chatWindowSlice.js";
import {
    messagesSliceReducer,
    setAgentsAction,
    setCurrentConversationAction,
} from "../../store/messages/messagesSlice.js";
import { CustomizationProvider } from "../CustomizationProvider.js";
import { type IChatMessagesGroup, groupMessages } from "../utils/groupUtility.js";

import { ConversationItemContents } from "./ConversationItemContents.js";

function renderReasoning(
    message: IChatConversationLocalItem,
    groups: IChatMessagesGroup[],
    isLoading = true,
    agents?: GenAIAgent[],
) {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
    });
    if (agents) {
        store.dispatch(setAgentsAction({ agents }));
    }
    const slot = vi.fn(() => null);
    const content = (currentGroups: IChatMessagesGroup[]) => (
        <Provider store={store}>
            <CustomizationProvider slots={{ MessageReasoningContent: slot }}>
                <ConversationItemContents
                    message={message}
                    groups={currentGroups}
                    references={[]}
                    role="assistant"
                    isLoading={isLoading}
                />
            </CustomizationProvider>
        </Provider>
    );
    const { rerender } = render(content(groups));

    return { store, slot, updateGroups: (nextGroups: IChatMessagesGroup[]) => rerender(content(nextGroups)) };
}

const user = { ...makeUserItem(), content: { type: "text" as const, text: "Question" }, createdAt: 1000 };
const reasoning = {
    ...makeAssistantItem(),
    content: { type: "reasoning" as const, summary: "Thinking" },
    createdAt: 1350,
};
const tool = {
    ...makeAssistantItem(),
    content: { type: "toolResult" as const, callId: "tool-1", result: "Done" },
    createdAt: 1850,
};

describe("ConversationItemContents answering agent", () => {
    const agents = [
        { id: "agent-a", title: "Agent A" },
        { id: "agent-b", title: "Agent B" },
    ];

    it("exposes the live message's agent id and name", () => {
        const message = { ...reasoning, agentId: "agent-a" };
        const { slot } = renderReasoning(message, groupMessages([user, message]), true, agents);

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({
                defaultProps: expect.objectContaining({
                    agent: { id: "agent-a", name: "Agent A" },
                    isLoading: true,
                }),
            }),
            undefined,
        );
    });

    it.each([
        [1, "agent-a", "Agent A"],
        [4, "agent-b", "Agent B"],
    ] as const)("keeps the saved message's agent after switching (%s)", (index, id, name) => {
        const messages = [
            user,
            { ...reasoning, agentId: "agent-a" },
            { ...tool, agentId: "agent-a" },
            { ...user, createdAt: 3000 },
            { ...reasoning, agentId: "agent-b", createdAt: 4000 },
        ].map((message) => makeConversationItem(message));
        const { slot, store, updateGroups } = renderReasoning(
            messages[index],
            groupMessages(messages),
            false,
            agents,
        );
        store.dispatch(
            setCurrentConversationAction({
                conversation: {
                    id: "conversation",
                    localId: "conversation",
                    title: "Conversation",
                    createdAt: "2026-01-01T00:00:00Z",
                    updatedAt: "2026-01-01T00:00:00Z",
                    agentId: "agent-b",
                },
            }),
        );
        updateGroups(groupMessages(messages));

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({
                defaultProps: expect.objectContaining({ agent: { id, name }, isLoading: false }),
            }),
            undefined,
        );
    });

    it.each([undefined, [] as GenAIAgent[], agents])("keeps an unavailable agent's id (%#)", (agentList) => {
        const message = { ...reasoning, agentId: "unavailable-agent" };
        const { slot } = renderReasoning(message, groupMessages([user, message]), true, agentList);

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({
                defaultProps: expect.objectContaining({ agent: { id: "unavailable-agent" } }),
            }),
            undefined,
        );
    });

    it("resolves the name when the agent list arrives after the message", () => {
        const message = { ...reasoning, agentId: "agent-a" };
        const { slot, store } = renderReasoning(message, groupMessages([user, message]));

        act(() => {
            store.dispatch(setAgentsAction({ agents }));
        });

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({
                defaultProps: expect.objectContaining({ agent: { id: "agent-a", name: "Agent A" } }),
            }),
            undefined,
        );
    });

    it("does not invent an answering agent when the message has none", () => {
        const { slot } = renderReasoning(reasoning, groupMessages([user, reasoning]), false, agents);

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({ defaultProps: expect.objectContaining({ agent: undefined }) }),
            undefined,
        );
    });
});

describe("ConversationItemContents reasoning duration", () => {
    it("updates from the live reasoning group timestamps without Intelligence flags or steps", () => {
        const { slot, updateGroups } = renderReasoning(reasoning, groupMessages([user, reasoning]));
        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({
                defaultProps: expect.objectContaining({
                    summary: "Thinking",
                    isLoading: true,
                    durationMs: 350,
                }),
            }),
            undefined,
        );

        updateGroups(groupMessages([user, reasoning, tool]));

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({ defaultProps: expect.objectContaining({ durationMs: 850 }) }),
            undefined,
        );
    });

    it("uses the matching saved reasoning group even when later responses exist", () => {
        const messages = [
            user,
            reasoning,
            tool,
            {
                ...user,
                role: "assistant" as const,
                content: { type: "text" as const, text: "Answer" },
                createdAt: 2000,
            },
            { ...user, createdAt: 3000 },
            { ...reasoning, createdAt: 4000 },
        ].map((message) => makeConversationItem(message));
        const { slot } = renderReasoning(messages[1], groupMessages(messages), false);

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({
                defaultProps: expect.objectContaining({ durationMs: 850, isLoading: false }),
            }),
            undefined,
        );
    });

    it("preserves zero duration", () => {
        const { slot } = renderReasoning(reasoning, groupMessages([{ ...user, createdAt: 1350 }, reasoning]));

        expect(slot).toHaveBeenLastCalledWith(
            expect.objectContaining({ defaultProps: expect.objectContaining({ durationMs: 0 }) }),
            undefined,
        );
    });

    it.each([{ groups: [] }, { groups: groupMessages([reasoning]) }])(
        "leaves unavailable group timing undefined (%#)",
        ({ groups }) => {
            const { slot } = renderReasoning(reasoning, groups);

            expect(slot).toHaveBeenLastCalledWith(
                expect.objectContaining({ defaultProps: expect.objectContaining({ durationMs: undefined }) }),
                undefined,
            );
        },
    );
});
