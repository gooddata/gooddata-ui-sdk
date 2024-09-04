// (C) 2024 GoodData Corporation
import React from "react";
import DefaultTextArea from "react-textarea-autosize";
import { defaultImport } from "default-import";
import DefaultNativeListener from "react-native-listener";
import cx from "classnames";
import { SendIcon } from "./SendIcon.js";
import { useDispatch, useSelector } from "react-redux";
import { makeUserMessage } from "../model.js";
import { agentLoadingSelector, newMessageAction } from "../store/index.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const TextareaAutosize = defaultImport(DefaultTextArea);
const NativeListener = defaultImport(DefaultNativeListener);

type InputProps = {
    // empty
};

export const Input: React.FC<InputProps> = () => {
    const [value, setValue] = React.useState("");
    const dispatch = useDispatch();
    const disabled = useSelector(agentLoadingSelector);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        // Autofocus the textarea when the chat is not disabled and the user is not focusing on another element
        // Important, given the disabled states changes depending on the agent's loading state
        // And it's loosing focus after the loading state changes
        if (!disabled && document.activeElement === document.body) {
            textareaRef.current?.focus();
        }
    }, [disabled]);

    const handleSubmit = () => {
        dispatch(newMessageAction(makeUserMessage(value)));
        setValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey && !disabled && value) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
    };

    const buttonClasses = cx("gd-gen-ai-chat__input__send_button", {
        "gd-gen-ai-chat__input__send_button--disabled": disabled || !value,
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
                disabled={disabled}
            />
            <NativeListener onClick={handleSubmit}>
                <SendIcon className={buttonClasses} />
            </NativeListener>
        </div>
    );
};
