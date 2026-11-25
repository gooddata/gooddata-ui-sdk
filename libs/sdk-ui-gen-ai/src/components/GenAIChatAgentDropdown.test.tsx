// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import { en_US } from "../localization/bundles/en-US.localization-bundle.js";
import { type GenAIAgent, type IChatConversationLocal } from "../model.js";
import { chatWindowSliceReducer } from "../store/chatWindow/chatWindowSlice.js";

import { CustomizationProvider } from "./CustomizationProvider.js";
import { GenAIChatAgentDropdown, type GenAIChatAgentDropdownProps } from "./GenAIChatAgentDropdown.js";

const agents: GenAIAgent[] = [
    { id: "sales", title: "Sales", modifiedAt: "2026-01-01T00:00:00Z" },
    { id: "support", title: "Support", modifiedAt: "2026-02-01T00:00:00Z" },
];
const conversations: IChatConversationLocal[] = [
    {
        id: "previous",
        localId: "previous",
        agentId: "sales",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    },
];
const messages = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));

function renderDropdown(overrides: Partial<GenAIChatAgentDropdownProps> = {}) {
    const store = configureStore({ reducer: { chatWindow: chatWindowSliceReducer } });
    const onSelectAgent = vi.fn();
    const props = { agents, onSelectAgent, ...overrides };
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <Provider store={store}>
                <IntlProvider locale="en" messages={messages}>
                    <CustomizationProvider>{children}</CustomizationProvider>
                </IntlProvider>
            </Provider>
        );
    }
    const { rerender } = render(<GenAIChatAgentDropdown {...props} />, { wrapper: Wrapper });
    return {
        onSelectAgent,
        rerender: (updates: Partial<GenAIChatAgentDropdownProps>) =>
            rerender(<GenAIChatAgentDropdown {...props} {...updates} />),
    };
}

describe("GenAIChatAgentDropdown selection", () => {
    it.each<{
        name: string;
        props: Partial<GenAIChatAgentDropdownProps>;
        updates: string[];
        label?: string;
    }>([
        {
            name: "prefers the available conversation agent",
            props: { conversationAgentId: "sales", selectedAgentId: "support" },
            updates: ["sales"],
            label: "Sales",
        },
        {
            name: "does not synchronize an already selected conversation agent",
            props: { conversationAgentId: "sales", selectedAgentId: "sales" },
            updates: [],
            label: "Sales",
        },
        {
            name: "reaffirms a valid selection for an unavailable conversation agent",
            props: { conversationAgentId: "retired", selectedAgentId: "sales" },
            updates: ["sales"],
            label: "Sales",
        },
        {
            name: "defaults when both candidates are unavailable",
            props: { conversationAgentId: "retired", selectedAgentId: "missing" },
            updates: ["support"],
        },
        {
            name: "keeps an available selection without a conversation",
            props: { selectedAgentId: "sales" },
            updates: [],
            label: "Sales",
        },
        { name: "defaults before conversations load", props: {}, updates: ["support"] },
        {
            name: "consults available conversation history for a default",
            props: { selectedAgentId: "missing", conversations },
            updates: ["sales"],
        },
        {
            name: "prefers last-used metadata over conversation history",
            props: {
                agents: [agents[0], { ...agents[1], lastUsedAt: "2026-03-01T00:00:00Z" }],
                conversations,
            },
            updates: ["support"],
        },
        {
            name: "does nothing without available agents",
            props: { agents: [], conversationAgentId: "sales", selectedAgentId: "support" },
            updates: [],
        },
        {
            name: "uses an explicit display selection without changing reconciliation",
            props: { effectiveSelectedAgentId: "support", conversationAgentId: "sales" },
            updates: ["sales"],
            label: "Support",
        },
    ])("$name", ({ props, updates, label }) => {
        const { onSelectAgent } = renderDropdown(props);

        expect(onSelectAgent.mock.calls).toEqual(updates.map((id) => [id]));
        const trigger = screen.getByTestId("agent_dropdown_button");
        expect(trigger.textContent).toBe(label ?? "Agents");
    });

    it("selects a default when agents arrive and stops once the selection is synchronized", () => {
        const { onSelectAgent, rerender } = renderDropdown({ agents: [] });
        expect(onSelectAgent).not.toHaveBeenCalled();

        rerender({ agents });
        expect(onSelectAgent).toHaveBeenCalledExactlyOnceWith("support");

        rerender({ agents, selectedAgentId: "support", conversations });
        expect(onSelectAgent).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("agent_dropdown_button")).toHaveTextContent("Support");
    });

    it("keeps the existing re-synchronization for an unavailable conversation on history updates", () => {
        const { onSelectAgent, rerender } = renderDropdown({
            conversationAgentId: "retired",
            selectedAgentId: "sales",
        });

        rerender({ conversations });

        expect(onSelectAgent.mock.calls).toEqual([["sales"], ["sales"]]);
    });

    it.each([{ isDisabled: true }, { isLoading: true }])(
        "keeps synchronization active with a disabled trigger: %j",
        (props) => {
            const { onSelectAgent } = renderDropdown(props);

            expect(screen.getByTestId("agent_dropdown_button")).toBeDisabled();
            expect(onSelectAgent).toHaveBeenCalledExactlyOnceWith("support");
        },
    );

    it("marks an explicit user selection as a change event", async () => {
        const { onSelectAgent } = renderDropdown({ selectedAgentId: "sales" });

        fireEvent.click(screen.getByTestId("agent_dropdown_button"));
        fireEvent.click(await screen.findByRole("menuitemradio", { name: "Support" }));

        expect(onSelectAgent).toHaveBeenCalledExactlyOnceWith("support", { showChangeEvent: true });
    });
});
