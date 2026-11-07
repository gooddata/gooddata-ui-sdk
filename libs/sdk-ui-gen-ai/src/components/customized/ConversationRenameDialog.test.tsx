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

import { DefaultConversationRenameDialog } from "./ConversationRenameDialog.js";

function TestRenameDialogConsumer({ conversation }: { conversation: IChatConversationLocal }) {
    const { ConversationRenameDialogComponent } = useCustomization();
    return (
        <ConversationRenameDialogComponent conversation={conversation} onRename={vi.fn()} onClose={vi.fn()} />
    );
}

describe("DefaultConversationRenameDialog", () => {
    const conversation: IChatConversationLocal = {
        id: "c1",
        localId: "c1",
        title: "Test Conversation",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    };

    it("renders default conversation rename dialog", () => {
        const store = configureStore({
            reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
        });

        render(
            <Provider store={store}>
                <IntlWrapper>
                    <DefaultConversationRenameDialog
                        conversation={conversation}
                        onRename={vi.fn()}
                        onClose={vi.fn()}
                    />
                </IntlWrapper>
            </Provider>,
        );

        expect(screen.getByText("Rename conversation")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test Conversation")).toBeInTheDocument();
    });

    it("supports custom slot override via CustomizationProvider", () => {
        const store = configureStore({
            reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
        });

        const customSlot = vi.fn(({ defaultProps }) => (
            <div data-testid="custom-rename-slot">{defaultProps.conversation.title}</div>
        ));

        render(
            <Provider store={store}>
                <IntlWrapper>
                    <CustomizationProvider slots={{ ConversationRenameDialog: customSlot }}>
                        <TestRenameDialogConsumer conversation={conversation} />
                    </CustomizationProvider>
                </IntlWrapper>
            </Provider>,
        );

        expect(screen.getByTestId("custom-rename-slot")).toHaveTextContent("Test Conversation");
    });
});
