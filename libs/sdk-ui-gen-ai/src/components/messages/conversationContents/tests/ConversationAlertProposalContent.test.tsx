// (C) 2024-2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import type { IChatConversationLocalItem, IChatConversationMultipartLocalPart } from "../../../../model.js";
import { ConversationAlertProposalContent } from "../ConversationAlertProposalContent.js";

describe("ConversationAlertProposalContent", () => {
    const renderWithIntl = (ui: ReactElement) => {
        return render(
            <IntlProvider
                locale="en"
                messages={{
                    "gd.gen-ai.alert-proposal.title": "Alert Proposal",
                    "gd.gen-ai.alert-proposal.summary.title": "Summary Title",
                }}
            >
                {ui}
            </IntlProvider>,
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

        renderWithIntl(
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

        renderWithIntl(
            <ConversationAlertProposalContent
                message={mockMessage}
                part={mockPart}
                alertProposal={alertProposal as any}
            />,
        );

        expect(screen.queryByText("Click me")).toBeNull();
    });
});
