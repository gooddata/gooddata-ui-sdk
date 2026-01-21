// (C) 2024-2026 GoodData Corporation

import {
    type FC,
    type LegacyRef,
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

import { type CatalogItem } from "@gooddata/sdk-model";
import { SyntaxHighlightingInput, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { makeTextContents, makeUserMessage } from "../model.js";
import { collectReferences, useCompletion } from "./completion/index.js";
import { useHighlight } from "./highlight/index.js";
import { type RootState, asyncProcessSelector, messagesSelector, newMessageAction } from "../store/index.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
import { escapeMarkdown } from "./utils/markdownUtils.js";

export type InputOwnProps = {
    autofocus?: boolean;
    catalogItems?: CatalogItem[];
    canManage?: boolean;
    canAnalyze?: boolean;
    targetRef?: LegacyRef<HTMLDivElement>;
};

type InputStateProps = {
    isBusy: boolean;
    isEvaluating: boolean;
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
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
    send: {
        id: "gd.gen-ai.button.send",
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
    catalogItems,
    canManage,
    canAnalyze,
    targetRef,
    messages,
    loading,
}: InputOwnProps & InputStateProps & InputDispatchProps) {
    const intl = useIntl();
    const { isBigScreen, isSmallScreen, isFullscreen } = useFullscreenCheck();

    const isLoading = loading === "loading" || loading === "clearing";
    const isEmpty = !messages?.length && !isLoading;

    const [value, setValue] = useState("");
    const [editorApi, setApi] = useState<EditorView | null>(null);
    const [focused, setFocused] = useState(false);

    const { onCompletion, used } = useCompletion(catalogItems, [], { canManage, canAnalyze });
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
        newMessage(
            makeUserMessage([
                makeTextContents(escapeMarkdown(value), collectReferences(value, used.current)),
            ]),
        );
        setValue("");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !isBusy && value) {
            e.preventDefault();
            handleSubmit();
            return true;
        }
        return false;
    };

    const buttonDisabled = !value || isBusy || isEvaluating;
    const buttonClasses = cx("gd-gen-ai-chat__input__send_button", {
        "gd-gen-ai-chat__input__send_button--disabled": buttonDisabled,
    });

    const sendLabel = intl.formatMessage(msgs.send);

    return (
        <div
            className={cx("gd-gen-ai-chat__input", {
                focused,
                "gd-gen-ai-chat__input--fullscreen": isFullscreen,
                "gd-gen-ai-chat__input--big-screen": isBigScreen,
                "gd-gen-ai-chat__input--small-screen": isSmallScreen,
                "gd-gen-ai-chat__input--empty": isEmpty,
            })}
        >
            <div className="gd-gen-ai-chat__input__content">
                <div
                    ref={targetRef}
                    onFocus={() => {
                        editorApi?.focus();
                    }}
                />
                <HintText focused={focused} where="top" />
                <SyntaxHighlightingInput
                    className="gd-gen-ai-chat__input__mc"
                    placeholder={intl.formatMessage(msgs.placeholder)}
                    label={isMac ? intl.formatMessage(msgs.labelMac) : intl.formatMessage(msgs.labelWin)}
                    value={value}
                    disabled={isBusy}
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
                <HintText focused={focused} where="bottom" />
                <div className={buttonClasses}>
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
                </div>
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
    messages: ReturnType<typeof messagesSelector>;
    loading: ReturnType<typeof asyncProcessSelector>;
} => {
    const asyncState = asyncProcessSelector(state);

    return {
        messages: messagesSelector(state),
        loading: asyncState,
        isBusy: !!asyncState,
        isEvaluating: asyncState === "evaluating",
    };
};

const mapDispatchToProps = {
    newMessage: newMessageAction,
};

export const Input: FC<InputOwnProps> = connect(mapStateToProps, mapDispatchToProps)(InputComponent);
