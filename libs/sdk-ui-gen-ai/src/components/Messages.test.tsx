// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { GOODSTRAP_SCROLLED_EVENT } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocal, makeUserItem } from "../model.js";
import {
    chatWindowSliceName,
    chatWindowSliceReducer,
    getInitialChatWindowState,
} from "../store/chatWindow/chatWindowSlice.js";
import {
    activateConversationAction,
    loadConversationSuccessAction,
    loadConversationsSuccessAction,
    loadThreadErrorAction,
    messagesSliceName,
    messagesSliceReducer,
    startNewConversationAction,
} from "../store/messages/messagesSlice.js";
import { queueActivateConversationMiddleware } from "../store/queues/queue.activateConversationAction.js";

import { type CustomizationContext, customizationContext } from "./CustomizationContext.js";
import { Messages } from "./Messages.js";

const components = {
    LandingScreenComponent: () => <div data-testid="landing-screen" />,
    UserMessageComponent: () => null,
    AssistantMessageComponent: () => null,
} as unknown as CustomizationContext["components"];

const makeConversation = (id: string): IChatConversationLocal => ({
    id,
    localId: id,
    title: id,
    createdAt: new Date(1).toISOString(),
    updatedAt: new Date(1).toISOString(),
    agentId: "gold",
});

const makeStore = () =>
    configureStore({
        reducer: {
            [chatWindowSliceName]: chatWindowSliceReducer,
            [messagesSliceName]: messagesSliceReducer,
        },
        preloadedState: {
            [chatWindowSliceName]: getInitialChatWindowState(),
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActionPaths: ["payload.error"],
                },
            }).prepend(queueActivateConversationMiddleware),
    });

const renderMessages = (store: ReturnType<typeof makeStore>) =>
    render(
        <Provider store={store}>
            <IntlProvider locale="en" messages={{}} onError={() => {}}>
                <customizationContext.Provider value={{ slots: {}, components }}>
                    <Messages />
                </customizationContext.Provider>
            </IntlProvider>
        </Provider>,
    );

describe("Messages", () => {
    it("keeps the loading skeleton visible while a queued conversation loads", () => {
        const store = makeStore();
        const conversation = makeConversation("conversation-1");
        const { container } = renderMessages(store);

        act(() => {
            store.dispatch(activateConversationAction({ conversationId: conversation.id }));
            store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));
        });

        expect(container.querySelector(".react-loading-skeleton")).not.toBeNull();
        expect(screen.queryByTestId("landing-screen")).toBeNull();

        act(() => {
            store.dispatch(
                loadConversationSuccessAction({
                    currentConversation: conversation,
                    conversationItems: [],
                }),
            );
        });

        expect(container.querySelector(".react-loading-skeleton")).toBeNull();
        expect(screen.getByTestId("landing-screen")).toBeInTheDocument();
    });

    it("shows the landing screen for a deliberately new empty conversation", () => {
        const store = makeStore();
        store.dispatch(loadConversationsSuccessAction({ conversations: [] }));
        store.dispatch(startNewConversationAction());

        renderMessages(store);

        expect(screen.getByTestId("landing-screen")).toBeInTheDocument();
    });

    it("does not show the loading skeleton when activating a cached conversation", () => {
        const store = makeStore();
        const conversation = makeConversation("conversation-1");
        store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));
        store.dispatch(
            loadConversationSuccessAction({
                currentConversation: conversation,
                conversationItems: [makeUserItem({ type: "text", text: "Existing message" })],
            }),
        );
        store.dispatch(startNewConversationAction());
        store.dispatch(activateConversationAction({ conversationId: conversation.id }));

        const { container } = renderMessages(store);

        expect(container.querySelector(".react-loading-skeleton")).toBeNull();
        expect(screen.queryByTestId("landing-screen")).toBeNull();
    });

    it.each(["before metadata loads", "after conversation activation"])(
        "stops loading after a thread fetch failure %s",
        (failureStage) => {
            const store = makeStore();
            const conversation = makeConversation("conversation-1");
            const { container } = renderMessages(store);

            if (failureStage === "after conversation activation") {
                act(() => {
                    store.dispatch(loadConversationsSuccessAction({ conversations: [conversation] }));
                    store.dispatch(activateConversationAction({ conversationId: conversation.id }));
                });
            }

            expect(container.querySelector(".react-loading-skeleton")).not.toBeNull();

            act(() => {
                store.dispatch(loadThreadErrorAction({ error: new Error("Failed to load conversation") }));
            });

            expect(store.getState().messages.loaded).toBe(true);
            expect(store.getState().messages.conversationsLoaded).toBe(true);
            expect(container.querySelector(".react-loading-skeleton")).toBeNull();
        },
    );

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
