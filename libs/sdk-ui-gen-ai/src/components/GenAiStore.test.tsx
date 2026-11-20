// (C) 2026 GoodData Corporation

import { type EnhancedStore, configureStore } from "@reduxjs/toolkit";
import { act, render, screen } from "@testing-library/react";
import { Provider, useSelector } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type GenAIObjectType } from "@gooddata/sdk-model";

import { type IChatConversationLocal, makeUserItem } from "../model.js";
import { chatWindowSliceReducer } from "../store/chatWindow/chatWindowSlice.js";
import {
    messagesSliceReducer,
    setCurrentConversationAction,
    setMessagesAction,
} from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { ConfigProvider, useConfig } from "./ConfigContext.js";
import { GenAiStore } from "./GenAiStore.js";

type StoreMode = "internal" | "injected" | "external";
type LinkPolicy = (type: GenAIObjectType) => boolean;

const objectTypes: GenAIObjectType[] = ["metric", "visualization", "dashboard", "document"];

function StoreProbe() {
    const { isLinkEnabled } = useConfig();
    const title = useSelector((state: RootState) => state.messages.currentConversation?.title);

    return (
        <>
            {objectTypes.map((type) => (
                <output key={type} data-testid={type}>
                    {isLinkEnabled ? String(isLinkEnabled(type)) : "unset"}
                </output>
            ))}
            <output data-testid="conversation-title">{title}</output>
        </>
    );
}

async function renderStore(mode: StoreMode, policy?: LinkPolicy, parentPolicy?: LinkPolicy) {
    const backend = recordedBackend({});
    const suppliedStore =
        mode === "internal"
            ? undefined
            : configureStore({
                  reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
              });
    const providedStore = mode === "injected" ? Promise.resolve(suppliedStore!) : undefined;
    const renderChildren = vi.fn((_store: EnhancedStore<RootState>) => <StoreProbe />);
    const view = (isLinkEnabled?: LinkPolicy, inheritedPolicy = parentPolicy) => {
        const content = (
            <ConfigProvider isLinkEnabled={inheritedPolicy}>
                <GenAiStore
                    backend={backend}
                    workspace="workspace"
                    providedStore={providedStore}
                    isLinkEnabled={isLinkEnabled}
                >
                    {renderChildren}
                </GenAiStore>
            </ConfigProvider>
        );

        return mode === "external" ? <Provider store={suppliedStore!}>{content}</Provider> : content;
    };
    const { rerender } = render(view(policy));

    await screen.findByTestId("metric");

    return {
        store: renderChildren.mock.lastCall![0],
        suppliedStore,
        renderChildren,
        rerenderPolicy: (nextPolicy?: LinkPolicy, nextParentPolicy = parentPolicy) =>
            rerender(view(nextPolicy, nextParentPolicy)),
    };
}

describe.each<StoreMode>(["internal", "injected", "external"])(
    "GenAiStore %s mode object-link policy",
    (mode) => {
        it("leaves the policy unset by default", async () => {
            await renderStore(mode);

            for (const type of objectTypes) {
                expect(screen.getByTestId(type)).toHaveTextContent("unset");
            }
        });

        it("forwards the predicate for every object type", async () => {
            await renderStore(mode, (type) => type !== "metric");

            expect(screen.getByTestId("metric")).toHaveTextContent("false");
            expect(screen.getByTestId("visualization")).toHaveTextContent("true");
            expect(screen.getByTestId("dashboard")).toHaveTextContent("true");
            expect(screen.getByTestId("document")).toHaveTextContent("true");
        });

        it("inherits the parent policy unless its own predicate overrides it", async () => {
            const parentPolicy = () => false;
            const { rerenderPolicy } = await renderStore(mode, undefined, parentPolicy);

            expect(screen.getByTestId("dashboard")).toHaveTextContent("false");

            rerenderPolicy((type) => type === "dashboard");
            expect(screen.getByTestId("dashboard")).toHaveTextContent("true");
            expect(screen.getByTestId("metric")).toHaveTextContent("false");

            rerenderPolicy();
            expect(screen.getByTestId("dashboard")).toHaveTextContent("false");

            rerenderPolicy(undefined, () => true);
            expect(screen.getByTestId("dashboard")).toHaveTextContent("true");
        });

        it("preserves store identity and conversation state when the predicate changes", async () => {
            const { store, renderChildren, rerenderPolicy } = await renderStore(mode);
            const conversation = {
                id: "thread-1",
                localId: "conversation-1",
                title: "Existing conversation",
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
            } satisfies IChatConversationLocal;
            const message = makeUserItem({ type: "text", text: "Keep this message" }, "message-1");

            act(() => {
                store.dispatch(setCurrentConversationAction({ conversation }));
                store.dispatch(setMessagesAction({ items: [message] }));
            });
            const messagesState = store.getState().messages;

            expect(screen.getByTestId("conversation-title")).toHaveTextContent(conversation.title);

            rerenderPolicy(() => true);
            expect(screen.getByTestId("metric")).toHaveTextContent("true");

            rerenderPolicy(() => false);
            expect(screen.getByTestId("metric")).toHaveTextContent("false");

            rerenderPolicy();
            expect(screen.getByTestId("metric")).toHaveTextContent("unset");
            expect(screen.getByTestId("conversation-title")).toHaveTextContent(conversation.title);
            expect(renderChildren.mock.calls.every(([renderedStore]) => renderedStore === store)).toBe(true);
            expect(store.getState().messages).toBe(messagesState);
            expect(store.getState().messages.currentConversation).toEqual(conversation);
        });
    },
);

it.each<StoreMode>(["injected", "external"])("reuses the supplied store in %s mode", async (mode) => {
    const { store, suppliedStore } = await renderStore(mode);

    expect(store).toBe(suppliedStore);
});
