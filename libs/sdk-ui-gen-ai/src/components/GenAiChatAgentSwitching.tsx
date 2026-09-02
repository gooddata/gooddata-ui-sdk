// (C) 2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useCallback, useEffect } from "react";

import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import {
    agentSwitchingActiveSelector,
    agentSwitchingEnabledSelector,
    reasoningEffortEnabledSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import {
    agentsSelector,
    conversationSelector,
    conversationsLoadedSelector,
    conversationsSelector,
    selectedAgentIdSelector,
    selectedEffortSelector,
} from "../store/messages/messagesSelectors.js";
import { setSelectedAgentAction, setSelectedEffortAction } from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { useCustomization } from "./CustomizationContext.js";
import { GenAIChatEffortDropdown } from "./GenAIChatEffortDropdown.js";
import { getAgentSelectionStatus, getEffectiveSelectedAgentId } from "./utils/agentSelection.js";

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
    conversationsLoaded: ReturnType<typeof conversationsLoadedSelector>;
    agents: ReturnType<typeof agentsSelector>;
    agentSwitchingEnabled: ReturnType<typeof agentSwitchingEnabledSelector>;
    agentSwitchingActive: ReturnType<typeof agentSwitchingActiveSelector>;
    selectedAgentId: ReturnType<typeof selectedAgentIdSelector>;
    selectedEffort: ReturnType<typeof selectedEffortSelector>;
    reasoningEffortEnabled: ReturnType<typeof reasoningEffortEnabledSelector>;
};

type IGenAiChatAgentSwitchingDispatchProps = {
    setSelectedAgent: (...args: Parameters<typeof setSelectedAgentAction>) => void;
    setSelectedEffort: (...args: Parameters<typeof setSelectedEffortAction>) => void;
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
    selectedEffort,
    reasoningEffortEnabled,
    agentSwitchingActive,
    disabled,
    onMouseDown,
    setSelectedAgent,
    setSelectedEffort,
    setBusy,
    setNoAgents,
    leftContent,
}: GenAiChatAgentSwitchingOwnProps &
    GenAiChatAgentSwitchingStateProps &
    IGenAiChatAgentSwitchingDispatchProps) {
    const intl = useIntl();
    const { AgentChooserComponent } = useCustomization();

    const sendLabel = intl.formatMessage(msgs.send);
    const noAgentAvailableLabel = intl.formatMessage(msgs.noAgentAvailable);

    const { availableAgents, hasNoAgents, isSelectionLoading } = getAgentSelectionStatus({
        agentSwitchingActive,
        assistantLoading: isAssistantLoading,
        conversationsLoading: isConversationsLoading,
        agents,
        selectedAgentId,
    });

    const effectiveSelectedAgentId = getEffectiveSelectedAgentId({
        agents: availableAgents,
        conversationAgentId: conversation?.agentId,
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

    const handleSelectEffort = useCallback(
        (effort: ReturnType<typeof selectedEffortSelector>) => {
            setSelectedEffort({ effort });
        },
        [setSelectedEffort],
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
                    {/* In preview mode (agentSwitchingActive is false) the assistant is pinned to the
                        agent being built, so the agent dropdown — and its in-menu Reasoning row — is
                        hidden. The effort selector is still relevant there, so it is shown standalone. */}
                    {agentSwitchingActive ? (
                        <AgentChooserComponent
                            agents={availableAgents}
                            conversations={conversations}
                            conversationAgentId={conversation?.agentId}
                            selectedAgentId={selectedAgentId}
                            effectiveSelectedAgentId={effectiveSelectedAgentId}
                            isDisabled={agentDropdownDisabled || isSelectionLoading}
                            isLoading={isSelectionLoading}
                            onSelectAgent={handleSelectAgent}
                            selectedEffort={selectedEffort}
                            onSelectEffort={handleSelectEffort}
                        />
                    ) : reasoningEffortEnabled ? (
                        <GenAIChatEffortDropdown
                            selectedEffort={selectedEffort}
                            isDisabled={agentDropdownDisabled}
                            onSelectEffort={handleSelectEffort}
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

export function GenAiChatAgentSwitching(ownProps: GenAiChatAgentSwitchingOwnProps) {
    const conversation = useSelector((state: RootState) => conversationSelector(state));
    const conversations = useSelector((state: RootState) => conversationsSelector(state));
    const conversationsLoaded = useSelector((state: RootState) => conversationsLoadedSelector(state));
    const agents = useSelector((state: RootState) => agentsSelector(state));
    const agentSwitchingEnabled = useSelector((state: RootState) => agentSwitchingEnabledSelector(state));
    const agentSwitchingActive = useSelector((state: RootState) => agentSwitchingActiveSelector(state));
    const selectedAgentId = useSelector((state: RootState) => selectedAgentIdSelector(state));
    const selectedEffort = useSelector((state: RootState) => selectedEffortSelector(state));
    const reasoningEffortEnabled = useSelector((state: RootState) => reasoningEffortEnabledSelector(state));

    const dispatch = useDispatch();
    const setSelectedAgent = useCallback(
        (...args: Parameters<typeof setSelectedAgentAction>) => {
            dispatch(setSelectedAgentAction(...args));
        },
        [dispatch],
    );
    const setSelectedEffort = useCallback(
        (...args: Parameters<typeof setSelectedEffortAction>) => {
            dispatch(setSelectedEffortAction(...args));
        },
        [dispatch],
    );

    return (
        <GenAiChatAgentSwitchingCore
            {...ownProps}
            conversation={conversation}
            conversations={conversations}
            conversationsLoaded={conversationsLoaded}
            agents={agents}
            agentSwitchingEnabled={agentSwitchingEnabled}
            agentSwitchingActive={agentSwitchingActive}
            selectedAgentId={selectedAgentId}
            selectedEffort={selectedEffort}
            reasoningEffortEnabled={reasoningEffortEnabled}
            setSelectedAgent={setSelectedAgent}
            setSelectedEffort={setSelectedEffort}
        />
    );
}
