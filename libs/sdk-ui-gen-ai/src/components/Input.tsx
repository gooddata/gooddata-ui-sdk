// (C) 2024-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { SendIcon } from "./SendIcon.js";
import { connect } from "react-redux";
import { makeTextContents, makeUserMessage } from "../model.js";
import { asyncProcessSelector, newMessageAction, RootState } from "../store/index.js";
import { defineMessages, injectIntl } from "react-intl";
import { WrappedComponentProps } from "react-intl/src/components/injectIntl.js";
import { SyntaxHighlightingInput, Button } from "@gooddata/sdk-ui-kit";
import { EditorView } from "@codemirror/view";

type InputStateProps = {
    isBusy: boolean;
    isEvaluating: boolean;
    autofocus?: boolean;
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

const InputComponent: React.FC<InputStateProps & InputDispatchProps & WrappedComponentProps> = ({
    isBusy,
    isEvaluating,
    newMessage,
    autofocus = false,
    intl,
}) => {
    const [value, setValue] = React.useState("");
    const [editorApi, setApi] = React.useState<EditorView | null>(null);

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
        newMessage(makeUserMessage([makeTextContents(value)]));
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
        <div className="gd-gen-ai-chat__input">
            <SyntaxHighlightingInput
                className="gd-gen-ai-chat__input__mc"
                placeholder={intl.formatMessage(messages.placeholder)}
                label={intl.formatMessage(messages.label)}
                value={value}
                onApi={setApi}
                onChange={setValue}
                onKeyDown={handleKeyDown}
                disabled={isBusy}
            />
            <Button
                disabled={buttonDisabled}
                className={buttonClasses}
                aria-label={intl.formatMessage(messages.send)}
                onClick={!buttonDisabled ? handleSubmit : undefined}
            >
                <SendIcon />
            </Button>
            {/*<div*/}
            {/*    role="button"*/}
            {/*    aria-label={intl.formatMessage(messages.send)}*/}
            {/*    onClick={!buttonDisabled ? handleSubmit : undefined}*/}
            {/*>*/}
            {/*    <SendIcon className={buttonClasses} />*/}
            {/*</div>*/}
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
