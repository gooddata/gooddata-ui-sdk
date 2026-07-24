// (C) 2026 GoodData Corporation

import { type FC, type MouseEvent, type ReactNode, useCallback, useEffect } from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";
import { connect } from "react-redux";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import {
    agentSwitchingActiveSelector,
    agentSwitchingEnabledSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import {
    agentsSelector,
    conversationSelector,
    conversationsLoadedSelector,
    conversationsSelector,
    selectedAgentIdSelector,
} from "../store/messages/messagesSelectors.js";
import { setSelectedAgentAction } from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { GenAIChatAgentDropdown } from "./GenAIChatAgentDropdown.js";
import { getAgentSelectionStatus } from "./utils/agentSelection.js";

const msgs = defineMessages({
    send: {
        id: "gd.gen-ai.button.send",
    },
    noAgentAvailable: {
        id: "gd.gen-ai.agent.unavailable",
    },
});

type GenAiChatAgentSwitchingOwnProps = {
    disabled: boolean;
    agentDropdownDisabled: boolean;
    isAssistantLoading: boolean;
    isConversationsLoading: boolean;
    handleSubmit: () => void;
    onMouseDown?: (event: MouseEvent<HTMLDivElement>) => void;
    setBusy?: (busy: boolean) => void;
    setNoAgents?: (noAgents: boolean) => void;
    leftContent?: ReactNode;
};

type GenAiChatAgentSwitchingStateProps = {
    conversation: ReturnType<typeof conversationSelector>;
    conversations: ReturnType<typeof conversationsSelector>;
    agents: ReturnType<typeof agentsSelector>;
    agentSwitchingEnabled: ReturnType<typeof agentSwitchingEnabledSelector>;
    agentSwitchingActive: ReturnType<typeof agentSwitchingActiveSelector>;
    selectedAgentId: ReturnType<typeof selectedAgentIdSelector>;
};

type IGenAiChatAgentSwitchingDispatchProps = {
    setSelectedAgent: typeof setSelectedAgentAction;
};

function GenAiChatAgentSwitchingCore({
    agentSwitchingEnabled,
    isAssistantLoading,
    isConversationsLoading,
    handleSubmit,
    conversations,
    conversation,
    agentDropdownDisabled,
    agents,
    selectedAgentId,
    agentSwitchingActive,
    disabled,
    onMouseDown,
    setSelectedAgent,
    setBusy,
    setNoAgents,
    leftContent,
}: GenAiChatAgentSwitchingOwnProps &
    GenAiChatAgentSwitchingStateProps &
    IGenAiChatAgentSwitchingDispatchProps) {
    const intl = useIntl();

    const sendLabel = intl.formatMessage(msgs.send);
    const noAgentAvailableLabel = intl.formatMessage(msgs.noAgentAvailable);

    const { availableAgents, hasNoAgents, isSelectionLoading } = getAgentSelectionStatus({
        agentSwitchingActive,
        assistantLoading: isAssistantLoading,
        conversationsLoading: isConversationsLoading,
        agents,
        selectedAgentId,
    });

    const buttonDisabled = disabled || (agentSwitchingActive && hasNoAgents);
    const isBusy = agentSwitchingActive && (hasNoAgents || isSelectionLoading);

    const handleSubmitHandler = useCallback(() => {
        if (agentSwitchingActive && hasNoAgents) {
            return;
        }
        if (isBusy) {
            return;
        }

        handleSubmit();
    }, [agentSwitchingActive, handleSubmit, hasNoAgents, isBusy]);

    const handleSelectAgent = useCallback(
        (agentId: string | undefined, options?: { showChangeEvent?: boolean }) => {
            setSelectedAgent({
                agentId,
                previousAgentId: conversation?.agentId ?? selectedAgentId,
                showChangeEvent: options?.showChangeEvent,
            });
        },
        [conversation?.agentId, selectedAgentId, setSelectedAgent],
    );

    useEffect(() => {
        setBusy?.(isBusy);
    }, [isBusy, setBusy]);
    useEffect(() => {
        setNoAgents?.(hasNoAgents);
    }, [setNoAgents, hasNoAgents]);

    return (
        <div
            className={cx({
                "gd-gen-ai-chat__input__actions": agentSwitchingEnabled,
                "gd-gen-ai-chat__input__send_button": !agentSwitchingEnabled,
                "gd-gen-ai-chat__input__send_button--disabled": !agentSwitchingEnabled && buttonDisabled,
            })}
            onMouseDown={agentSwitchingEnabled ? onMouseDown : undefined}
        >
            {leftContent}
            {agentSwitchingActive && hasNoAgents ? (
                <span
                    className="gd-gen-ai-chat__input__no-agent"
                    data-testid="no_agent_available"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {noAgentAvailableLabel}
                </span>
            ) : agentSwitchingEnabled ? (
                <>
                    {/* The switcher is hidden in preview mode (agentSwitchingActive is
                                    false): the assistant is pinned to the preview agent being built,
                                    but the new input/button layout is kept. */}
                    {agentSwitchingActive ? (
                        <GenAIChatAgentDropdown
                            agents={availableAgents}
                            conversations={conversations}
                            conversationAgentId={conversation?.agentId}
                            selectedAgentId={selectedAgentId}
                            isDisabled={agentDropdownDisabled || isSelectionLoading}
                            isLoading={isSelectionLoading}
                            onSelectAgent={handleSelectAgent}
                        />
                    ) : null}
                    <UiTooltip
                        triggerBy={["focus", "hover"]}
                        arrowPlacement="bottom"
                        anchor={
                            <UiIconButton
                                icon="arrowUp"
                                variant="primary"
                                size="small"
                                dataTestId="send_message"
                                isDisabled={buttonDisabled}
                                onClick={buttonDisabled ? undefined : handleSubmitHandler}
                                accessibilityConfig={{
                                    ariaLabel: sendLabel,
                                }}
                            />
                        }
                        content={sendLabel}
                    />
                </>
            ) : (
                <UiTooltip
                    triggerBy={["focus", "hover"]}
                    arrowPlacement="bottom"
                    anchor={
                        <UiIconButton
                            icon="send"
                            variant="tertiary"
                            size="medium"
                            dataTestId="send_message"
                            isDisabled={buttonDisabled}
                            onClick={buttonDisabled ? undefined : handleSubmitHandler}
                            accessibilityConfig={{
                                ariaLabel: sendLabel,
                            }}
                        />
                    }
                    content={sendLabel}
                />
            )}
        </div>
    );
}

const mapStateToProps = (
    state: RootState,
): {
    conversation: ReturnType<typeof conversationSelector>;
    conversations: ReturnType<typeof conversationsSelector>;
    conversationsLoaded: ReturnType<typeof conversationsLoadedSelector>;
    agents: ReturnType<typeof agentsSelector>;
    agentSwitchingEnabled: ReturnType<typeof agentSwitchingEnabledSelector>;
    agentSwitchingActive: ReturnType<typeof agentSwitchingActiveSelector>;
    selectedAgentId: ReturnType<typeof selectedAgentIdSelector>;
} => {
    return {
        conversation: conversationSelector(state),
        conversations: conversationsSelector(state),
        conversationsLoaded: conversationsLoadedSelector(state),
        agents: agentsSelector(state),
        agentSwitchingEnabled: agentSwitchingEnabledSelector(state),
        agentSwitchingActive: agentSwitchingActiveSelector(state),
        selectedAgentId: selectedAgentIdSelector(state),
    };
};

const mapDispatchToProps = {
    setSelectedAgent: setSelectedAgentAction,
};

export const GenAiChatAgentSwitching: FC<GenAiChatAgentSwitchingOwnProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GenAiChatAgentSwitchingCore);
