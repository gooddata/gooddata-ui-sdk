// (C) 2024-2025 GoodData Corporation
import React, { ReactNode, useEffect, useMemo, useReducer, useRef, useState } from "react";
import cx from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { SyntaxHighlightingInput, Button } from "@gooddata/sdk-ui-kit";
import { CatalogItem } from "@gooddata/sdk-model";
import { EditorView } from "@codemirror/view";

import { asyncProcessSelector, newMessageAction } from "../store/index.js";
import { makeTextContents, makeUserMessage } from "../model.js";

import { collectReferences, useCompletion } from "./completion/index.js";
import { useHighlight } from "./highlight/index.js";
import { SendIcon } from "./SendIcon.js";

export type InputOwnProps = {
    autofocus?: boolean;
    catalogItems?: CatalogItem[];
    canManage?: boolean;
    canAnalyze?: boolean;
    targetRef?: React.LegacyRef<HTMLDivElement>;
};

const messages = defineMessages({
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

export function Input({ autofocus = false, catalogItems, canManage, canAnalyze, targetRef }: InputOwnProps) {
    const intl = useIntl();
    const dispatch = useDispatch();

    const process = useSelector(asyncProcessSelector);
    const isBusy = !!process;
    const isEvaluating = process === "evaluating";

    const [value, setValue] = useState("");
    const [editorApi, setApi] = useState<EditorView | null>(null);
    const [focused, setFocused] = useState(false);

    const { onCompletion, used } = useCompletion(catalogItems, [], { canManage, canAnalyze });
    const highlightExtension = useHighlight(used);

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
            if (document.activeElement !== editorApi.contentDOM) {
                timeout = window.setTimeout(update, 25);
            } else {
                forceFocusOnce.current = false;
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
            forceFocusOnce.current = true;
        },
        [],
    );

    const handleSubmit = () => {
        dispatch(
            newMessageAction(
                makeUserMessage([makeTextContents(value, collectReferences(value, used.current))]),
            ),
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

    return (
        <div
            className={cx("gd-gen-ai-chat__input", {
                focused,
            })}
        >
            <div
                ref={targetRef}
                onFocus={() => {
                    editorApi?.focus();
                }}
            />
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
                label={isMac ? intl.formatMessage(messages.labelMac) : intl.formatMessage(messages.labelWin)}
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
}
