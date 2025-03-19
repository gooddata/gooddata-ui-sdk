// (C) 2024 GoodData Corporation
import React from "react";
import DefaultTextArea from "react-textarea-autosize";
import { defaultImport } from "default-import";
import cx from "classnames";
import { SendIcon } from "./SendIcon.js";
import { connect } from "react-redux";
import { makeTextContents, makeUserMessage } from "../model.js";
import { asyncProcessSelector, newMessageAction, RootState } from "../store/index.js";
import { defineMessages, injectIntl } from "react-intl";
import { WrappedComponentProps } from "react-intl/src/components/injectIntl.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const TextareaAutosize = defaultImport(DefaultTextArea);

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
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Force focus when autofocus is enables on the first mount, right after the initial state is loaded
    const forceFocusOnce = React.useRef<boolean>(autofocus);
    React.useEffect(() => {
        // Autofocus the textarea when the chat is not disabled and the user is not focusing on another element
        // Important, given the disabled states changes depending on the agent's loading state
        // And it's loosing focus after the loading state changes
        if (!isBusy && (forceFocusOnce.current || document.activeElement === document.body)) {
            textareaRef.current?.focus();
            forceFocusOnce.current = false;
        }
    }, [isBusy]);

    const handleSubmit = () => {
        newMessage(makeUserMessage([makeTextContents(value)]));
        setValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !isBusy && value) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };

    const buttonDisabled = !value || isBusy || isEvaluating;
    const buttonClasses = cx("gd-gen-ai-chat__input__send_button", {
        "gd-gen-ai-chat__input__send_button--disabled": buttonDisabled,
    });

    return (
        <div className="gd-gen-ai-chat__input">
            <TextareaAutosize
                ref={textareaRef}
                className="gd-gen-ai-chat__input__textarea"
                placeholder={intl.formatMessage(messages.placeholder)}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={isBusy}
                aria-label={intl.formatMessage(messages.label)}
            />
            <div
                role="button"
                aria-label={intl.formatMessage(messages.send)}
                onClick={!buttonDisabled ? handleSubmit : undefined}
            >
                <SendIcon className={buttonClasses} />
            </div>
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
