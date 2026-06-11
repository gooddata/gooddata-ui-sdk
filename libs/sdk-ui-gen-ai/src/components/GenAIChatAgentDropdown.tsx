// (C) 2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { Dropdown, UiButton, UiIcon, UiMenu, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { type GenAIAgent, type IChatConversationLocal } from "../model.js";

import { getEffectiveSelectedAgentId, selectDefaultAgentId } from "./utils/agentSelection.js";

const msgs = defineMessages({
    agent: {
        id: "gd.gen-ai.agents",
    },
    loading: {
        id: "gd.gen-ai.agents.loading",
    },
});

type AgentMenuItemData = {
    interactive: GenAIAgent;
};

export type GenAIChatAgentDropdownProps = {
    agents: GenAIAgent[];
    conversations?: IChatConversationLocal[];
    conversationAgentId?: string;
    selectedAgentId?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    onSelectAgent: (agentId: string | undefined, options?: { showChangeEvent?: boolean }) => void;
};

export function GenAIChatAgentDropdown({
    agents,
    conversations,
    conversationAgentId,
    selectedAgentId,
    isDisabled,
    isLoading,
    onSelectAgent,
}: GenAIChatAgentDropdownProps) {
    const intl = useIntl();
    const effectiveSelectedAgentId = getEffectiveSelectedAgentId({
        agents,
        conversationAgentId,
        selectedAgentId,
    });
    const selectedAgent = agents.find((agent) => agent.id === effectiveSelectedAgentId);
    const agentLabel = intl.formatMessage(msgs.agent);
    const loadingLabel = `${intl.formatMessage(msgs.loading)}…`;

    useEffect(() => {
        const isConversationAgentAvailable =
            !!conversationAgentId && agents.some((agent) => agent.id === conversationAgentId);
        const isSelectedAgentAvailable =
            !!selectedAgentId && agents.some((agent) => agent.id === selectedAgentId);

        if (conversationAgentId) {
            if (isConversationAgentAvailable) {
                if (conversationAgentId !== selectedAgentId) {
                    onSelectAgent(conversationAgentId);
                }
                return;
            }

            if (agents.length) {
                onSelectAgent(
                    isSelectedAgentAvailable ? selectedAgentId : selectDefaultAgentId(agents, conversations),
                );
            }
            return;
        }

        if (!isSelectedAgentAvailable && agents.length) {
            // Resolve a default as soon as agents are loaded. selectDefaultAgentId always yields an
            // agent from agent metadata alone (lastUsedAt, then modifiedAt), so input usability never
            // depends on the conversations list loading. The conversations are still consulted as a
            // best-effort "last used conversation agent" heuristic when they are already available.
            onSelectAgent(selectDefaultAgentId(agents, conversations));
        }
    }, [agents, conversationAgentId, conversations, onSelectAgent, selectedAgentId]);

    const items = useMemo(
        () =>
            agents.map((agent) => {
                const isSelected = agent.id === effectiveSelectedAgentId;

                return {
                    type: "interactive" as const,
                    id: agent.id,
                    stringTitle: agent.title,
                    isSelected,
                    isDisabled: false,
                    data: agent,
                    tooltip: agent.description || undefined,
                    ariaAttributes: agent.description
                        ? { "aria-label": `${agent.title}. ${agent.description}` }
                        : undefined,
                    iconRight: agent.description ? (
                        <UiIcon
                            type="question"
                            size={12}
                            color={isSelected ? "complementary-7" : "complementary-5"}
                            accessibilityConfig={{ ariaHidden: true }}
                        />
                    ) : undefined,
                };
            }),
        [agents, effectiveSelectedAgentId],
    );

    return (
        <>
            <span className="sr-only" aria-live="polite" aria-atomic="true">
                {isLoading ? loadingLabel : ""}
            </span>
            <Dropdown
                className={cx("gd-gen-ai-chat__input__agent-dropdown", {
                    "gd-gen-ai-chat__input__agent-dropdown--loading": isLoading,
                })}
                alignPoints={[{ align: "tr br", offset: { x: 0, y: 0 } }]}
                closeOnEscape
                fullscreenOnMobile={false}
                autofocusOnOpen
                accessibilityConfig={{}}
                renderButton={({ isOpen, toggleDropdown, accessibilityConfig }) => (
                    <UiButton
                        label={isLoading ? loadingLabel : (selectedAgent?.title ?? agentLabel)}
                        variant="dropdownInline"
                        size="small"
                        iconAfter={isLoading ? undefined : isOpen ? "navigateUp" : "navigateDown"}
                        isDisabled={isLoading || isDisabled || !agents.length}
                        onClick={toggleDropdown}
                        dataTestId="agent_dropdown_button"
                        accessibilityConfig={accessibilityConfig}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu<AgentMenuItemData>
                        dataTestId="agent_dropdown_menu"
                        items={items}
                        size="small"
                        minWidth={160}
                        maxWidth={220}
                        containerTopPadding="small"
                        containerBottomPadding="small"
                        MenuHeader={AgentMenuHeader}
                        ariaAttributes={ariaAttributes}
                        onSelect={(item) => {
                            onSelectAgent(item.data.id, { showChangeEvent: true });
                            closeDropdown();
                        }}
                    />
                )}
            />
        </>
    );
}

function AgentMenuHeader() {
    const intl = useIntl();

    return <UiSubmenuHeader title={intl.formatMessage(msgs.agent)} height="medium" />;
}
