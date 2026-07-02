// (C) 2026 GoodData Corporation

import { act, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { type IChatMessagesGroup } from "../../utils/groupUtility.js";
import { ItemsGroup } from "../ItemsGroup.js";

describe("ItemsGroup", () => {
    beforeAll(() => {
        Element.prototype.animate = vi.fn().mockReturnValue({
            finished: Promise.resolve(),
            cancel: vi.fn(),
        });
    });

    const renderWithIntl = (ui: React.ReactElement) => {
        return render(
            <IntlProvider
                locale="en"
                messages={{
                    "gd.gen-ai.state.thinking": "Thinking",
                    "gd.gen-ai.routing.thinking-process": "Thinking process",
                }}
            >
                {ui}
            </IntlProvider>,
        );
    };

    it("should render system group by just returning children", () => {
        const group: IChatMessagesGroup = {
            type: "system",
            messages: [],
        };
        renderWithIntl(
            <ItemsGroup group={group}>
                <div data-testid="system-content">System Content</div>
            </ItemsGroup>,
        );

        expect(screen.getByTestId("system-content")).toBeDefined();
    });

    it("should render reasoning group with animated headings", async () => {
        const group: IChatMessagesGroup = {
            type: "reasoning",
            messages: [
                {
                    id: "1",
                    role: "assistant",
                    content: { type: "reasoning", summary: "# Heading 1\nContent 1" },
                    createdAt: Date.now(),
                    type: "item",
                    replyTo: "1",
                    responseId: "1",
                    localId: "1",
                },
            ],
        };

        const { rerender } = renderWithIntl(
            <ItemsGroup group={group}>
                <div>Reasoning Content</div>
            </ItemsGroup>,
        );

        expect(screen.getByText("Heading 1...")).toBeDefined();

        const updatedGroup: IChatMessagesGroup = {
            ...group,
            messages: [
                ...group.messages,
                {
                    id: "2",
                    role: "assistant",
                    content: { type: "reasoning", summary: "# Heading 2\nContent 2" },
                    createdAt: Date.now() + 1000,
                    type: "item",
                    replyTo: "1",
                    responseId: "1",
                    localId: "1",
                },
            ],
        };

        await act(async () => {
            rerender(
                <IntlProvider
                    locale="en"
                    messages={{
                        "gd.gen-ai.state.thinking": "Thinking",
                        "gd.gen-ai.routing.thinking-process": "Thinking process",
                    }}
                >
                    <ItemsGroup group={updatedGroup}>
                        <div>Reasoning Content</div>
                    </ItemsGroup>
                </IntlProvider>,
            );
        });

        expect(screen.getByText("Heading 1...")).toBeDefined();
        expect(screen.getByText("Heading 2...")).toBeDefined();

        // Simulate animation end for the old heading
        const oldHeading = screen.getByText("Heading 1...");
        await act(async () => {
            oldHeading.dispatchEvent(new Event("animationend", { bubbles: true }));
        });

        expect(screen.queryByText("Heading 1...")).toBeNull();
        expect(screen.getByText("Heading 2...")).toBeDefined();
    });
});
