// (C) 2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../localization/IntlWrapper.js";
import { type IChatConversationLocal } from "../model.js";
import { chatWindowSliceReducer } from "../store/chatWindow/chatWindowSlice.js";
import { messagesSliceReducer } from "../store/messages/messagesSlice.js";

import { ConversationRenameDialog } from "./ConversationRenameDialog.js";
import { type IGenAIAssistantConversationRenameDialogProps } from "./customized/types.js";

function renderDialog(
    props: Partial<IGenAIAssistantConversationRenameDialogProps> & { conversation: IChatConversationLocal },
) {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
    });

    const defaultProps: IGenAIAssistantConversationRenameDialogProps = {
        onRename: vi.fn(),
        onClose: vi.fn(),
        ...props,
    };

    return render(
        <Provider store={store}>
            <IntlWrapper>
                <ConversationRenameDialog {...defaultProps} />
            </IntlWrapper>
        </Provider>,
    );
}

describe("ConversationRenameDialog", () => {
    const conversation: IChatConversationLocal = {
        id: "c1",
        localId: "c1",
        title: "Initial Title",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    };

    it("renders default localized copy", () => {
        renderDialog({ conversation });

        expect(screen.getByText("Rename conversation")).toBeInTheDocument();
        expect(screen.getByText("Conversation name")).toBeInTheDocument();
        expect(screen.getByText("Rename")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Initial Title")).toBeInTheDocument();
    });

    it("allows overriding title, label, submitButtonText, and cancelButtonText", () => {
        renderDialog({
            conversation,
            title: "Custom Title",
            label: "Custom Label",
            submitButtonText: "Custom Save",
            cancelButtonText: "Custom Cancel",
        });

        expect(screen.getByText("Custom Title")).toBeInTheDocument();
        expect(screen.getByText("Custom Label")).toBeInTheDocument();
        expect(screen.getByText("Custom Save")).toBeInTheDocument();
        expect(screen.getByText("Custom Cancel")).toBeInTheDocument();
    });

    it("calls onRename with trimmed value on submit", () => {
        const onRename = vi.fn();
        renderDialog({ conversation, onRename });

        const input = screen.getByDisplayValue("Initial Title");
        fireEvent.change(input, { target: { value: "  New Title  " } });

        const submitBtn = screen.getByText("Rename");
        fireEvent.click(submitBtn);

        expect(onRename).toHaveBeenCalledTimes(1);
        expect(onRename).toHaveBeenCalledWith("New Title");
    });

    it("disables submit button when value is empty or only whitespace", () => {
        const onRename = vi.fn();
        renderDialog({ conversation, onRename });

        const input = screen.getByDisplayValue("Initial Title");
        fireEvent.change(input, { target: { value: "   " } });

        const submitBtn = screen.getByText("Rename").closest("button");
        expect(submitBtn).toHaveAttribute("aria-disabled", "true");

        fireEvent.click(submitBtn!);
        expect(onRename).not.toHaveBeenCalled();
    });

    it("calls onClose on cancel", () => {
        const onClose = vi.fn();
        renderDialog({ conversation, onClose });

        const cancelBtn = screen.getByText("Cancel");
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
