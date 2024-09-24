// (C) 2024 GoodData Corporation
import React from "react";
import DefaultTextArea from "react-textarea-autosize";
import { defaultImport } from "default-import";
import cx from "classnames";
import { SendIcon } from "./SendIcon.js";
import { useDispatch, useSelector } from "react-redux";
import { makeAssistantCancelledMessage, makeUserTextMessage } from "../model.js";
import { agentLoadingSelector, newMessageAction } from "../store/index.js";
import { StopIcon } from "./StopIcon.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const TextareaAutosize = defaultImport(DefaultTextArea);

type InputProps = {
    // empty
};

export const Input: React.FC<InputProps> = () => {
    const [value, setValue] = React.useState("");
    const dispatch = useDispatch();
    const isBusy = useSelector(agentLoadingSelector);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        // Autofocus the textarea when the chat is not disabled and the user is not focusing on another element
        // Important, given the disabled states changes depending on the agent's loading state
        // And it's loosing focus after the loading state changes
        if (!isBusy && document.activeElement === document.body) {
            textareaRef.current?.focus();
        }
    }, [isBusy]);

    const handleSubmit = () => {
        dispatch(newMessageAction(makeUserTextMessage(value)));
        setValue("");
    };

    const handleCancel = () => {
        dispatch(newMessageAction(makeAssistantCancelledMessage()));
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

    const buttonClasses = cx("gd-gen-ai-chat__input__send_button", {
        "gd-gen-ai-chat__input__send_button--disabled": !value,
    });

    return (
        <div className="gd-gen-ai-chat__input">
            <TextareaAutosize
                ref={textareaRef}
                className="gd-gen-ai-chat__input__textarea"
                placeholder="Ask here…"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={isBusy}
            />
            <div onClick={isBusy ? handleCancel : handleSubmit}>
                {!isBusy ? (
                    <SendIcon className={buttonClasses} />
                ) : (
                    <StopIcon className="gd-gen-ai-chat__input__send_button" />
                )}
            </div>
        </div>
    );
};
