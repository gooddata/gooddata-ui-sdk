// (C) 2024-2026 GoodData Corporation

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../model.js";
import { chatWindowSliceName, chatWindowSliceReducer } from "../../../store/chatWindow/chatWindowSlice.js";

import { ConversationAlertProposalContent } from "./ConversationAlertProposalContent.js";

describe("ConversationAlertProposalContent", () => {
    const renderWithStoreAndIntl = (ui: ReactElement) => {
        const store = configureStore({
            reducer: {
                [chatWindowSliceName]: chatWindowSliceReducer,
            },
        });
        return render(
            <Provider store={store}>
                <IntlProvider
                    locale="en"
                    messages={{
                        "gd.gen-ai.alert-proposal.title": "Alert Proposal",
                        "gd.gen-ai.alert-proposal.summary.title": "Summary Title",
                    }}
                >
                    {ui}
                </IntlProvider>
            </Provider>,
        );
    };

    const mockMessage: IChatConversationLocalItem = {
        id: "1",
        role: "assistant",
        type: "item",
        createdAt: Date.now(),
        content: { type: "multipart", parts: [] },
        localId: "1",
        responseId: "1",
    };

    const mockPart: IChatConversationMultipartLocalPart = {
        type: "alertProposal",
    };

    it("should render CTA when alertProposal.cta is present", () => {
        const alertProposal = {
            title: "Test Alert",
            description: "Test Description",
            cta: "Click me",
        };

        renderWithStoreAndIntl(
            <ConversationAlertProposalContent
                message={mockMessage}
                part={mockPart}
                alertProposal={alertProposal as any}
            />,
        );

        expect(screen.getByText("Click me")).toBeDefined();
    });

    it("should not render CTA when alertProposal.cta is not present", () => {
        const alertProposal = {
            title: "Test Alert",
            description: "Test Description",
        };

        renderWithStoreAndIntl(
            <ConversationAlertProposalContent
                message={mockMessage}
                part={mockPart}
                alertProposal={alertProposal as any}
            />,
        );

        expect(screen.queryByText("Click me")).toBeNull();
    });
});
