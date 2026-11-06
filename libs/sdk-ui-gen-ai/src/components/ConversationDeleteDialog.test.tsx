// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../localization/IntlWrapper.js";
import { type IChatConversationLocal } from "../model.js";
import { chatWindowSliceReducer } from "../store/chatWindow/chatWindowSlice.js";
import { messagesSliceReducer } from "../store/messages/messagesSlice.js";

import { ConversationDeleteDialog } from "./ConversationDeleteDialog.js";
import { type IGenAIAssistantConversationDeleteDialogProps } from "./customized/types.js";

function renderDialog(
    props: Partial<IGenAIAssistantConversationDeleteDialogProps> & { conversation: IChatConversationLocal },
) {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
    });

    const defaultProps: IGenAIAssistantConversationDeleteDialogProps = {
        onDelete: props.onDelete ?? vi.fn(),
        onClose: props.onClose ?? vi.fn(),
        ...props,
    };

    return render(
        <Provider store={store}>
            <IntlWrapper>
                <ConversationDeleteDialog {...defaultProps} />
            </IntlWrapper>
        </Provider>,
    );
}

describe("ConversationDeleteDialog", () => {
    const conversation: IChatConversationLocal = {
        id: "c1",
        localId: "c1",
        title: "Test Conversation",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    };

    it("renders default localized copy", () => {
        renderDialog({ conversation });

        expect(screen.getByText("Delete conversation?")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Test Conversation")).toBeInTheDocument();
    });

    it("allows overriding title, body, submitButtonText, and cancelButtonText", () => {
        renderDialog({
            conversation,
            title: "Custom Delete Title",
            body: ({ name }) => <div>Custom confirmation text {name}</div>,
            submitButtonText: "Confirm Delete",
            cancelButtonText: "Keep Conversation",
        });

        expect(screen.getByText("Custom Delete Title")).toBeInTheDocument();
        expect(screen.getByText("Custom confirmation text Test Conversation")).toBeInTheDocument();
        expect(screen.getByText("Confirm Delete")).toBeInTheDocument();
        expect(screen.getByText("Keep Conversation")).toBeInTheDocument();
    });

    it("calls onDelete on submit", () => {
        const onDelete = vi.fn();
        renderDialog({ conversation, onDelete });

        const submitBtn = screen.getByText("Delete");
        fireEvent.click(submitBtn);

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("calls onClose on cancel", () => {
        const onClose = vi.fn();
        renderDialog({ conversation, onClose });

        const cancelBtn = screen.getByText("Cancel");
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
