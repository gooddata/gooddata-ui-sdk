// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../localization/IntlWrapper.js";
import { type IChatConversationLocal } from "../../model.js";
import { chatWindowSliceReducer } from "../../store/chatWindow/chatWindowSlice.js";
import { messagesSliceReducer } from "../../store/messages/messagesSlice.js";
import { useCustomization } from "../CustomizationContext.js";
import { CustomizationProvider } from "../CustomizationProvider.js";

import { DefaultConversationDeleteDialog } from "./ConversationDeleteDialog.js";

function TestDeleteDialogConsumer({ conversation }: { conversation: IChatConversationLocal }) {
    const { ConversationDeleteDialogComponent } = useCustomization();
    return (
        <ConversationDeleteDialogComponent conversation={conversation} onDelete={vi.fn()} onClose={vi.fn()} />
    );
}

describe("DefaultConversationDeleteDialog", () => {
    const conversation: IChatConversationLocal = {
        id: "c1",
        localId: "c1",
        title: "Test Conversation",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    };

    it("renders default conversation delete dialog", () => {
        const store = configureStore({
            reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
        });

        render(
            <Provider store={store}>
                <IntlWrapper>
                    <DefaultConversationDeleteDialog
                        conversation={conversation}
                        onDelete={vi.fn()}
                        onClose={vi.fn()}
                    />
                </IntlWrapper>
            </Provider>,
        );

        expect(screen.getByText("Delete conversation?")).toBeInTheDocument();
        expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });

    it("supports custom slot override via CustomizationProvider", () => {
        const store = configureStore({
            reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
        });

        const customSlot = vi.fn(({ defaultProps }) => (
            <div data-testid="custom-delete-slot">{defaultProps.conversation.title}</div>
        ));

        render(
            <Provider store={store}>
                <IntlWrapper>
                    <CustomizationProvider slots={{ ConversationDeleteDialog: customSlot }}>
                        <TestDeleteDialogConsumer conversation={conversation} />
                    </CustomizationProvider>
                </IntlWrapper>
            </Provider>,
        );

        expect(screen.getByTestId("custom-delete-slot")).toHaveTextContent("Test Conversation");
    });
});
