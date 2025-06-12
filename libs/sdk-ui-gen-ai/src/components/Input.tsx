// (C) 2024-2025 GoodData Corporation
import React, { ReactNode, useMemo } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { defineMessages, FormattedMessage, injectIntl } from "react-intl";
import { WrappedComponentProps } from "react-intl/src/components/injectIntl.js";
import { SyntaxHighlightingInput, Button } from "@gooddata/sdk-ui-kit";
import { CatalogItem } from "@gooddata/sdk-model";
import { EditorView } from "@codemirror/view";

import { asyncProcessSelector, newMessageAction, RootState } from "../store/index.js";
import { makeTextContents, makeUserMessage } from "../model.js";

import { collectReferences, useCompletion } from "./completion/index.js";
import { useHighlight } from "./highlight/index.js";
import { SendIcon } from "./SendIcon.js";

type InputStateProps = {
    isBusy: boolean;
    isEvaluating: boolean;
    autofocus?: boolean;
    catalogItems?: CatalogItem[];
    canManage?: boolean;
    canAnalyze?: boolean;
};

type InputDispatchProps = {
    newMessage: typeof newMessageAction;
};

const messages = defineMessages({
    placeholder: {
        id: "gd.gen-ai.input-placeholder",
    },
    label: {
        id: "gd.gen-ai.input-label",
    },
    send: {
        id: "gd.gen-ai.button.send",
    },
});

const isMac =
    typeof navigator !== "undefined" &&
    (navigator.platform.toUpperCase().indexOf("MAC") >= 0 || navigator.userAgent.includes("Macintosh"));

const InputComponent: React.FC<InputStateProps & InputDispatchProps & WrappedComponentProps> = ({
    isBusy,
    isEvaluating,
    newMessage,
    autofocus = false,
    intl,
    catalogItems,
    canManage,
    canAnalyze,
}) => {
    const [value, setValue] = React.useState("");
    const [editorApi, setApi] = React.useState<EditorView | null>(null);
    const [focused, setFocused] = React.useState(false);

    const { onCompletion, used } = useCompletion(catalogItems, [], { canManage, canAnalyze });
    const highlightExtension = useHighlight(used);

    const extensions = useMemo(() => [highlightExtension], [highlightExtension]);

    // Force focus when autofocus is enables on the first mount, right after the initial state is loaded
    const forceFocusOnce = React.useRef<boolean>(autofocus);
    React.useEffect(() => {
        // Autofocus the textarea when the chat is not disabled and the user is not focusing on another element
        // Important, given the disabled states changes depending on the agent's loading state
        // And it's loosing focus after the loading state changes
        if (!isBusy && (forceFocusOnce.current || document.activeElement === document.body) && editorApi) {
            editorApi.focus();
            forceFocusOnce.current = false;
        }
    }, [isBusy, editorApi]);

    const handleSubmit = () => {
        newMessage(makeUserMessage([makeTextContents(value, collectReferences(value, used.current))]));
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

    return (
        <div
            className={cx("gd-gen-ai-chat__input", {
                focused,
            })}
        >
            <div
                className={cx("gd-gen-ai-chat__input__info", {
                    hidden: !focused,
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
            <SyntaxHighlightingInput
                className="gd-gen-ai-chat__input__mc"
                placeholder={intl.formatMessage(messages.placeholder)}
                label={intl.formatMessage(messages.label)}
                value={value}
                disabled={isBusy}
                autocompletion={{
                    aboveCursor: true,
                    whenTyping: true,
                    whenTypingDelay: 300,
                }}
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
            <Button
                disabled={buttonDisabled}
                className={buttonClasses}
                onClick={!buttonDisabled ? handleSubmit : undefined}
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage(messages.send),
                }}
            >
                <SendIcon />
            </Button>
        </div>
    );
};

const mapStateToProps = (state: RootState): { isBusy: boolean; isEvaluating: boolean } => {
    const asyncState = asyncProcessSelector(state);

    return {
        isBusy: !!asyncState,
        isEvaluating: asyncState === "evaluating",
    };
};

const mapDispatchToProps = {
    newMessage: newMessageAction,
};

export const Input = connect(mapStateToProps, mapDispatchToProps)(injectIntl(InputComponent));
