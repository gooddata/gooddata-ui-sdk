// (C) 2024-2026 GoodData Corporation

import {
    type FC,
    type LegacyRef,
    type MouseEvent,
    type ReactNode,
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

import { SyntaxHighlightingInput } from "@gooddata/sdk-ui-kit";

import {
    type IChatConversationLocalItem,
    type UserMessage,
    makeTextContents,
    makeUserItem,
    makeUserMessage,
} from "../model.js";
import { agentSwitchingEnabledSelector } from "../store/chatWindow/chatWindowSelectors.js";
import {
    asyncProcessSelector,
    conversationMessagesSelector,
    conversationSelector,
    messagesSelector,
} from "../store/messages/messagesSelectors.js";
import { newMessageAction, setSelectedAgentAction } from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { collectReferences } from "./completion/references.js";
import { useCompletion } from "./completion/useCompletion.js";
import { GenAiChatAgentSwitching } from "./GenAiChatAgentSwitching.js";
import { GenAiChatContextChooser } from "./GenAiChatContextChooser.js";
import { GenAIChatContextIndicator } from "./GenAIChatContextIndicator.js";
import { useHighlight } from "./highlight/useHighlight.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
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
    items: ReturnType<typeof conversationMessagesSelector>;
    agentSwitchingEnabled: ReturnType<typeof agentSwitchingEnabledSelector>;
};

type InputDispatchProps = {
    newMessage: typeof newMessageAction;
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
    items,
    agentSwitchingEnabled,
    loading,
}: InputOwnProps & InputStateProps & InputDispatchProps) {
    const intl = useIntl();
    const { isBigScreen, isSmallScreen, isFullscreen } = useFullscreenCheck();

    const isLoading = loading === "loading" || loading === "clearing";
    const isAssistantLoading = isLoading || loading === "restoring";
    const isEmpty = conversation ? !items?.length && !isLoading : !messages?.length && !isLoading;

    const [value, setValue] = useState("");
    const [areAgentsBusy, setAreAgentsBusy] = useState(true);
    const [hasNoAgents, setHasNoAgents] = useState(false);
    const [editorApi, setApi] = useState<EditorView | null>(null);
    const [focused, setFocused] = useState(false);

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
            if (isBusy || !trimmed || areAgentsBusy) {
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

    const handleContextMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        editorApi?.focus();
    };

    const handleOnFocus = () => {
        editorApi?.focus();
    };

    const agentDropdownDisabled = isBusy || isEvaluating;
    const buttonDisabled = !value.trim() || agentDropdownDisabled;

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
                    <div className="gd-gen-ai-chat__input__context" onMouseDown={handleContextMouseDown}>
                        <GenAIChatContextIndicator onDelete={handleOnFocus} />
                    </div>
                    <div ref={targetRef} onFocus={handleOnFocus} />
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
                    <GenAiChatAgentSwitching
                        disabled={buttonDisabled}
                        isAssistantLoading={isAssistantLoading}
                        agentDropdownDisabled={agentDropdownDisabled}
                        handleSubmit={handleSubmit}
                        onMouseDown={handleActionsMouseDown}
                        setBusy={setAreAgentsBusy}
                        setNoAgents={setHasNoAgents}
                        leftContent={<GenAiChatContextChooser onAddContext={handleOnFocus} />}
                    />
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
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
    agentSwitchingEnabled: ReturnType<typeof agentSwitchingEnabledSelector>;
} => {
    const asyncState = asyncProcessSelector(state);

    return {
        conversation: conversationSelector(state),
        items: conversationMessagesSelector(state),
        messages: messagesSelector(state),
        loading: asyncState,
        agentSwitchingEnabled: agentSwitchingEnabledSelector(state),
        isBusy: !!asyncState,
        isEvaluating: asyncState === "evaluating",
    };
};

const mapDispatchToProps = {
    newMessage: newMessageAction,
    setSelectedAgent: setSelectedAgentAction,
};

export const Input: FC<InputOwnProps> = connect(mapStateToProps, mapDispatchToProps)(InputComponent);
