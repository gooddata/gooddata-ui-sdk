// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { act, render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { en_US } from "../localization/bundles/en-US.localization-bundle.js";
import { type IChatConversationLocal } from "../model.js";
import { chatWindowSliceReducer } from "../store/chatWindow/chatWindowSlice.js";
import { messagesSliceReducer, setSelectedAgentAction } from "../store/messages/messagesSlice.js";

import { CustomizationProvider } from "./CustomizationProvider.js";
import { type IGenAIAssistantAgentChooserProps } from "./customized/types.js";
import { GenAiChatAgentSwitching } from "./GenAiChatAgentSwitching.js";

const agents = [
    { id: "sales", title: "Sales" },
    { id: "support", title: "Support" },
];
const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

describe("GenAiChatAgentSwitching selection", () => {
    function renderSwitching(conversationAgentId?: string, selectedAgentId?: string) {
        const conversation: IChatConversationLocal = {
            id: "thread",
            localId: "local-thread",
            agentId: conversationAgentId,
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z",
        };
        const store = configureStore({
            reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
            preloadedState: {
                messages: {
                    ...messagesSliceReducer(undefined, { type: "test/init" }),
                    agents,
                    currentConversation: conversation,
                    selectedAgentId,
                },
            },
        });
        const dispatch = vi.spyOn(store, "dispatch");
        let chooserProps: IGenAIAssistantAgentChooserProps | undefined;
        function Wrapper({ children }: PropsWithChildren) {
            return (
                <Provider store={store}>
                    <IntlProvider locale="en" messages={messages}>
                        <CustomizationProvider
                            slots={{
                                AgentChooser: ({ defaultProps }) => {
                                    chooserProps = defaultProps;
                                    return null;
                                },
                                SendButton: () => null,
                            }}
                        >
                            {children}
                        </CustomizationProvider>
                    </IntlProvider>
                </Provider>
            );
        }
        const handleOnFocus = vi.fn();
        render(
            <GenAiChatAgentSwitching
                disabled={false}
                agentDropdownDisabled={false}
                isAssistantLoading={false}
                isConversationsLoading={false}
                isInProgress={false}
                handleSubmit={vi.fn()}
                handleOnFocus={handleOnFocus}
            />,
            { wrapper: Wrapper },
        );
        return { store, dispatch, handleOnFocus, getChooserProps: () => chooserProps! };
    }

    it.each([
        { conversationAgentId: "sales", selectedAgentId: "support", effective: "sales" },
        { conversationAgentId: "retired", selectedAgentId: "support", effective: "support" },
        { conversationAgentId: undefined, selectedAgentId: "sales", effective: "sales" },
        { conversationAgentId: "retired", selectedAgentId: "missing", effective: undefined },
        { conversationAgentId: undefined, selectedAgentId: undefined, effective: undefined },
    ])(
        "passes conversation-backed selection to custom choosers: %j",
        ({ conversationAgentId, selectedAgentId, effective }) => {
            const { getChooserProps, dispatch } = renderSwitching(conversationAgentId, selectedAgentId);

            expect(getChooserProps()).toMatchObject({
                agents,
                conversationAgentId,
                selectedAgentId,
                effectiveSelectedAgentId: effective,
                isLoading: !agents.some((agent) => agent.id === selectedAgentId),
                isDisabled: !agents.some((agent) => agent.id === selectedAgentId),
            });
            expect(dispatch).not.toHaveBeenCalled();
        },
    );

    it.each(["sales", undefined])(
        "preserves the previous-agent identity %s and explicit change option",
        (previousAgentId) => {
            const { getChooserProps, dispatch, handleOnFocus } = renderSwitching(previousAgentId, "support");

            act(() => getChooserProps().onSelectAgent("support", { showChangeEvent: true }));

            expect(dispatch).toHaveBeenCalledExactlyOnceWith(
                setSelectedAgentAction({
                    agentId: "support",
                    previousAgentId: previousAgentId ?? "support",
                    showChangeEvent: true,
                }),
            );
            expect(handleOnFocus).toHaveBeenCalledTimes(1);
        },
    );
});
