// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
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
import { conversationMessagesSelector } from "../../store/messages/messagesSelectors.js";
import {
    loadConversationSuccessAction,
    loadConversationsSuccessAction,
    messagesSliceReducer,
    setAgentsAction,
    setCurrentConversationAction,
    startNewConversationAction,
} from "../../store/messages/messagesSlice.js";
import { CustomizationProvider } from "../CustomizationProvider.js";
import { DefaultLandingQuestion } from "../customized/LandingQuestion.js";
import { type IGenAIAssistantSlots } from "../customized/types.js";
import { type IChatMessagesGroup, groupMessages } from "../utils/groupUtility.js";

import { ConversationItemContents } from "./ConversationItemContents.js";

function renderContent(message: IChatConversationLocalItem, slots?: IGenAIAssistantSlots) {
    const store = configureStore({
        reducer: { chatWindow: chatWindowSliceReducer, messages: messagesSliceReducer },
    });
    return render(
        <Provider store={store}>
            <IntlProvider locale="en">
                <CustomizationProvider slots={slots}>
                    <ConversationItemContents
                        message={message}
                        role={message.role === "user" ? "user" : "assistant"}
                        groups={[]}
                        references={[]}
                        isLoading={false}
                    />
                </CustomizationProvider>
            </IntlProvider>
        </Provider>,
    );
}

describe("ConversationItemContents text", () => {
    it.each([
        "test. # + - ( ) [ ] \\",
        "**bold** and _italic_ and `code`",
        "# Heading",
        "[label](https://example.com)",
        "test\\# and C:\\temp\\file",
        "What about the U.S. state?",
        "this is ~~struck~~ text",
        "launch :rocket: now",
        "quote:\n> quoted line\n# heading\n1. item\n- bullet",
        "a - b # c + d (e) [f] *g* _h_ !i `j` ~~struck~~ :rocket: <b>tag</b> C:\\data\\a_b.csv a | b",
        "  leading spaces\n\n    indented text\n\tand a tab",
        "&copy; &#35; &amp; <https://example.com>",
    ])("renders user text literally without modifying the message: %s", (text) => {
        const message = makeUserItem({ type: "text", text });
        const { container } = renderContent(message);

        expect(container.textContent).toBe(text);
        expect(container.querySelector("strong, em, code, h1, a, del, blockquote, ol, ul, b")).toBeNull();
        expect(message.content).toEqual({ type: "text", text });
    });

    it("keeps Markdown formatting in assistant messages", () => {
        const { container } = renderContent(
            makeAssistantItem({ type: "text", text: "**bold** ~~struck~~ :rocket:\n\n> quote\n\n- item" }),
        );

        expect(container.querySelector("strong")).toHaveTextContent("bold");
        expect(container.querySelector("del")).toHaveTextContent("struck");
        expect(container).toHaveTextContent("🚀");
        expect(container.querySelector("blockquote")).toHaveTextContent("quote");
        expect(container.querySelector("ul li")).toHaveTextContent("item");
    });

    it("keeps reference chips in literal user text", () => {
        const { container } = renderContent(
            makeUserItem({
                type: "text",
                text: "Show **this** {metric/revenue_total} #1 ~~struck~~ :rocket:\n> quote",
                objects: [{ id: "revenue_total", type: "metric", title: "Revenue" }],
            }),
        );

        expect(container.textContent).toBe("Show **this** Revenue #1 ~~struck~~ :rocket:\n> quote");
        expect(container.querySelector(".gd-gen-ai-chat__message__object.metric")).toHaveTextContent(
            "Revenue",
        );
        expect(container.querySelector(".gd-ui-kit-tooltip__anchor")).toHaveTextContent("Revenue");
    });

    it.each(["user", "assistant"] as const)(
        "passes raw %s text and its rendering mode to the slot",
        (role) => {
            const text = "U.S. **bold** ~~struck~~ :rocket:\n> quote";
            const slot = vi.fn<NonNullable<IGenAIAssistantSlots["MessageTextContent"]>>(
                ({ Default, defaultProps }) => <Default {...defaultProps} />,
            );
            const message =
                role === "user"
                    ? makeUserItem({ type: "text", text })
                    : makeAssistantItem({ type: "text", text });

            const { container } = renderContent(message, { MessageTextContent: slot });

            expect(slot).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    defaultProps: expect.objectContaining({ text, useMarkdown: role !== "user" }),
                }),
                undefined,
            );
            expect(container.textContent === text).toBe(role === "user");
            expect(container.querySelector("strong")?.textContent).toBe(role === "user" ? undefined : "bold");
        },
    );

    it.each([
        "this is ~~struck~~ text",
        "launch :rocket: now",
        "quote:\n> quoted line\n# heading\n1. item\n- bullet",
    ])("renders saved user messages literally after loading history: %s", (text) => {
        const message = makeUserItem({
            type: "text",
            text: `${text}\n{metric/revenue_total}`,
            objects: [{ id: "revenue_total", type: "metric", title: "Revenue" }],
        });
        const currentConversation = {
            id: "conversation",
            localId: "conversation",
            title: "Conversation",
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
        };
        const store = configureStore({
            reducer: { chatWindow: chatWindowSliceReducer, messages: messagesSliceReducer },
        });
        store.dispatch(loadConversationsSuccessAction({ conversations: [currentConversation] }));
        store.dispatch(
            loadConversationSuccessAction({
                currentConversation,
                conversationItems: [message],
            }),
        );

        const savedMessage = conversationMessagesSelector(store.getState())[0];
        const { container } = renderContent(savedMessage);

        expect(container.textContent).toBe(`${text}\nRevenue`);
        expect(container.querySelector("del, blockquote, h1, ol, ul")).toBeNull();
        expect(savedMessage.content).toEqual(message.content);
    });

    it("stores landing questions as raw user text", () => {
        const store = configureStore({
            reducer: { chatWindow: chatWindowSliceReducer, messages: messagesSliceReducer },
        });
        store.dispatch(loadConversationsSuccessAction({ conversations: [] }));
        store.dispatch(setAgentsAction({ agents: [{ id: "agent", title: "Agent" }] }));
        store.dispatch(startNewConversationAction());
        const question = "Show **revenue** #1";
        render(
            <Provider store={store}>
                <IntlProvider locale="en">
                    <DefaultLandingQuestion question={question} answer="Example answer." />
                </IntlProvider>
            </Provider>,
        );

        fireEvent.click(screen.getByRole("button", { name: question }));

        expect(conversationMessagesSelector(store.getState())[0].content).toEqual({
            type: "text",
            text: question,
        });
    });
});

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
