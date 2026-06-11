// (C) 2024-2026 GoodData Corporation

import {
    type FC,
    type LegacyRef,
    type MouseEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";

import { type EditorView } from "@codemirror/view";
import cx from "classnames";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { connect } from "react-redux";

import { SyntaxHighlightingInput, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import {
    type IChatConversationLocalItem,
    type UserMessage,
    makeTextContents,
    makeUserItem,
    makeUserMessage,
} from "../model.js";
import {
    agentSwitchingActiveSelector,
    agentSwitchingEnabledSelector,
} from "../store/chatWindow/chatWindowSelectors.js";
import {
    agentsSelector,
    asyncProcessSelector,
    conversationMessagesSelector,
    conversationSelector,
    conversationsLoadedSelector,
    conversationsSelector,
    messagesSelector,
    selectedAgentIdSelector,
} from "../store/messages/messagesSelectors.js";
import { newMessageAction, setSelectedAgentAction } from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { collectReferences } from "./completion/references.js";
import { useCompletion } from "./completion/useCompletion.js";
import { GenAIChatAgentDropdown } from "./GenAIChatAgentDropdown.js";
import { useHighlight } from "./highlight/useHighlight.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
import { getAgentSelectionStatus } from "./utils/agentSelection.js";
import { escapeMarkdown } from "./utils/markdownUtils.js";

export type InputOwnProps = {
    autofocus?: boolean;
    canManage?: boolean;
    canAnalyze?: boolean;
    targetRef?: LegacyRef<HTMLDivElement>;
};

type InputStateProps = {
    isBusy: boolean;
    isEvaluating: boolean;
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
    conversation: ReturnType<typeof conversationSelector>;
    conversations: ReturnType<typeof conversationsSelector>;
    conversationsLoaded: ReturnType<typeof conversationsLoadedSelector>;
    items: ReturnType<typeof conversationMessagesSelector>;
    agents: ReturnType<typeof agentsSelector>;
    agentSwitchingEnabled: ReturnType<typeof agentSwitchingEnabledSelector>;
    agentSwitchingActive: ReturnType<typeof agentSwitchingActiveSelector>;
    selectedAgentId: ReturnType<typeof selectedAgentIdSelector>;
};

type InputDispatchProps = {
    newMessage: typeof newMessageAction;
    setSelectedAgent: typeof setSelectedAgentAction;
};

const msgs = defineMessages({
    placeholder: {
        id: "gd.gen-ai.input-placeholder",
    },
    labelMac: {
        id: "gd.gen-ai.input-label.mac",
    },
    labelWin: {
        id: "gd.gen-ai.input-label.win",
    },
    send: {
        id: "gd.gen-ai.button.send",
    },
    noAgentAvailable: {
        id: "gd.gen-ai.agent.unavailable",
    },
});

const isMac =
    typeof navigator !== "undefined" &&
    (navigator.platform.toUpperCase().indexOf("MAC") >= 0 || navigator.userAgent.includes("Macintosh"));

function InputComponent({
    isBusy,
    isEvaluating,
    newMessage,
    autofocus = false,
    canManage,
    canAnalyze,
    targetRef,
    messages,
    conversation,
    conversations,
    conversationsLoaded,
    items,
    agents,
    agentSwitchingEnabled,
    agentSwitchingActive,
    loading,
    selectedAgentId,
    setSelectedAgent,
}: InputOwnProps & InputStateProps & InputDispatchProps) {
    const intl = useIntl();
    const { isBigScreen, isSmallScreen, isFullscreen } = useFullscreenCheck();

    const isLoading = loading === "loading" || loading === "clearing";
    const isAssistantLoading = isLoading || loading === "restoring";
    const isEmpty = conversation ? !items?.length && !isLoading : !messages?.length && !isLoading;

    const [value, setValue] = useState("");
    const [editorApi, setApi] = useState<EditorView | null>(null);
    const [focused, setFocused] = useState(false);
    const { availableAgents, hasNoAgents, isSelectionLoading } = getAgentSelectionStatus({
        agentSwitchingActive,
        assistantLoading: isAssistantLoading,
        conversationsLoaded,
        agents,
        selectedAgentId,
    });

    const { onCompletion, used } = useCompletion([], { canManage, canAnalyze });
    const { highlightExtension, atomicCursorExtension } = useHighlight(used);

    const beforeExtensions = useMemo(() => [atomicCursorExtension], [atomicCursorExtension]);
    const extensions = useMemo(() => [highlightExtension], [highlightExtension]);

    // Force focus when autofocus is enables on the first mount, right after the initial state is loaded
    const forceFocusOnce = useRef<boolean>(autofocus);
    const [updates, update] = useReducer((x) => x + 1, 0);
    useEffect(() => {
        // Autofocus the textarea when the chat is not disabled and the user is not focusing on another element
        // Important, given the disabled states changes depending on the agent's loading state
        // And it's loosing focus after the loading state changes
        if (isBusy || !editorApi) {
            return;
        }
        const makeFocus = forceFocusOnce.current || document.activeElement === document.body;
        let timeout: number | undefined;
        if (makeFocus) {
            editorApi.focus();
            if (document.activeElement === editorApi.contentDOM) {
                forceFocusOnce.current = false;
            } else {
                timeout = window.setTimeout(update, 25);
            }
        }
        return () => {
            if (timeout) {
                window.clearTimeout(timeout);
            }
        };
    }, [isBusy, editorApi, updates]);
    useEffect(
        () => () => {
            // When unmount occurred, reset the autofocus
            forceFocusOnce.current = true;
        },
        [],
    );

    const handleSubmit = () => {
        if (agentSwitchingActive && hasNoAgents) {
            return;
        }

        let item: IChatConversationLocalItem | UserMessage;
        if (conversation) {
            item = makeUserItem({
                type: "text",
                text: escapeMarkdown(value),
                objects: collectReferences(value, used.current),
            });
        } else {
            item = makeUserMessage([
                makeTextContents(escapeMarkdown(value), collectReferences(value, used.current)),
            ]);
        }
        newMessage(item);
        setValue("");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            const trimmed = value.trim();
            if (isBusy || !trimmed || (agentSwitchingActive && (hasNoAgents || isSelectionLoading))) {
                return true;
            }
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
            return true;
        }
        return false;
    };

    const handleActionsMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) {
            return;
        }

        e.preventDefault();
        editorApi?.focus();
    };

    const agentDropdownDisabled = isBusy || isEvaluating || isSelectionLoading;
    const buttonDisabled = !value.trim() || agentDropdownDisabled || (agentSwitchingActive && hasNoAgents);
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

    const sendLabel = intl.formatMessage(msgs.send);
    const noAgentAvailableLabel = intl.formatMessage(msgs.noAgentAvailable);

    return (
        <div
            className={cx("gd-gen-ai-chat__input", {
                focused,
                "gd-gen-ai-chat__input--fullscreen": isFullscreen,
                "gd-gen-ai-chat__input--big-screen": isBigScreen,
                "gd-gen-ai-chat__input--small-screen": isSmallScreen,
                "gd-gen-ai-chat__input--empty": isEmpty,
                "gd-gen-ai-chat__input--agent-switching": agentSwitchingEnabled,
                "gd-gen-ai-chat__input--no-agents": hasNoAgents,
            })}
        >
            <div className="gd-gen-ai-chat__input__content">
                <HintText focused={focused} where="top" />
                <div className="gd-gen-ai-chat__input__container">
                    <div
                        ref={targetRef}
                        onFocus={() => {
                            editorApi?.focus();
                        }}
                    />
                    <div className="gd-gen-ai-chat__input__text">
                        <SyntaxHighlightingInput
                            className="gd-gen-ai-chat__input__mc"
                            placeholder={intl.formatMessage(msgs.placeholder)}
                            label={
                                isMac ? intl.formatMessage(msgs.labelMac) : intl.formatMessage(msgs.labelWin)
                            }
                            value={value}
                            autocompletion={{
                                aboveCursor: true,
                                whenTyping: true,
                                whenTypingDelay: 300,
                            }}
                            beforeExtensions={beforeExtensions}
                            extensions={extensions}
                            onApi={setApi}
                            onChange={setValue}
                            onFocus={() => {
                                setFocused(true);
                            }}
                            onBlur={() => {
                                setFocused(false);
                            }}
                            onKeyDown={handleKeyDown}
                            onCompletion={onCompletion}
                        />
                    </div>
                    <div
                        className={cx({
                            "gd-gen-ai-chat__input__actions": agentSwitchingEnabled,
                            "gd-gen-ai-chat__input__send_button": !agentSwitchingEnabled,
                            "gd-gen-ai-chat__input__send_button--disabled":
                                !agentSwitchingEnabled && buttonDisabled,
                        })}
                        onMouseDown={agentSwitchingEnabled ? handleActionsMouseDown : undefined}
                    >
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
                                        isDisabled={agentDropdownDisabled}
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
                                            onClick={buttonDisabled ? undefined : handleSubmit}
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
                                        onClick={buttonDisabled ? undefined : handleSubmit}
                                        accessibilityConfig={{
                                            ariaLabel: sendLabel,
                                        }}
                                    />
                                }
                                content={sendLabel}
                            />
                        )}
                    </div>
                </div>
                <HintText focused={focused} where="bottom" />
            </div>
        </div>
    );
}

interface IHintTextProps {
    focused: boolean;
    where: "top" | "bottom";
}

function HintText({ where, focused }: IHintTextProps) {
    return (
        <div
            aria-hidden={!focused}
            className={cx("gd-gen-ai-chat__input__info", {
                hidden: !focused,
                top: where === "top",
                bottom: where === "bottom",
            })}
        >
            {isMac ? (
                <FormattedMessage
                    id="gd.gen-ai.autocomplete.input-info.mac"
                    values={{
                        code: (chunks: ReactNode) => <code>{chunks}</code>,
                    }}
                />
            ) : (
                <FormattedMessage
                    id="gd.gen-ai.autocomplete.input-info.win"
                    values={{
                        code: (chunks: ReactNode) => <code>{chunks}</code>,
                    }}
                />
            )}
        </div>
    );
}

const mapStateToProps = (
    state: RootState,
): {
    isBusy: boolean;
    isEvaluating: boolean;
    items: ReturnType<typeof conversationMessagesSelector>;
    conversation: ReturnType<typeof conversationSelector>;
    conversations: ReturnType<typeof conversationsSelector>;
    conversationsLoaded: ReturnType<typeof conversationsLoadedSelector>;
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
    agents: ReturnType<typeof agentsSelector>;
    agentSwitchingEnabled: ReturnType<typeof agentSwitchingEnabledSelector>;
    agentSwitchingActive: ReturnType<typeof agentSwitchingActiveSelector>;
    selectedAgentId: ReturnType<typeof selectedAgentIdSelector>;
} => {
    const asyncState = asyncProcessSelector(state);

    return {
        conversation: conversationSelector(state),
        conversations: conversationsSelector(state),
        conversationsLoaded: conversationsLoadedSelector(state),
        items: conversationMessagesSelector(state),
        messages: messagesSelector(state),
        loading: asyncState,
        agents: agentsSelector(state),
        agentSwitchingEnabled: agentSwitchingEnabledSelector(state),
        agentSwitchingActive: agentSwitchingActiveSelector(state),
        selectedAgentId: selectedAgentIdSelector(state),
        isBusy: !!asyncState,
        isEvaluating: asyncState === "evaluating",
    };
};

const mapDispatchToProps = {
    newMessage: newMessageAction,
    setSelectedAgent: setSelectedAgentAction,
};

export const Input: FC<InputOwnProps> = connect(mapStateToProps, mapDispatchToProps)(InputComponent);
