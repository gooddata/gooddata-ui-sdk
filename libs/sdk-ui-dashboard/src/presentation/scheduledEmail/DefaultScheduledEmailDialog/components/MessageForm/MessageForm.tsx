// (C) 2025 GoodData Corporation
import React, { useRef, useState } from "react";
import { Textarea } from "../Textarea.js";
import { defineMessage, useIntl } from "react-intl";

const MAX_MESSAGE_LENGTH = 10000;

const errorMessage = defineMessage({ id: "dialogs.schedule.destination.message.length" });

interface IMessageFormProps {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
}

export const MessageForm: React.FC<IMessageFormProps> = ({ value, onChange }) => {
    const intl = useIntl();
    const textareaRef = useRef<Textarea | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.target.select(); // Selects all text on focus
    };

    const validateInput = (textAreaValue: string) => {
        if (textAreaValue.length > MAX_MESSAGE_LENGTH) {
            setValidationError(errorMessage.id);
        } else {
            setValidationError(null);
        }
    };

    const handleOnTitleChange = (textAreaValue: string) => {
        if (validationError) {
            validateInput(textAreaValue);
        }
        onChange(textAreaValue, textAreaValue.length > MAX_MESSAGE_LENGTH);
    };

    return (
        <Textarea
            ref={textareaRef}
            id="schedule.message"
            className="gd-notifications-channels-dialog-message s-gd-notifications-channels-dialog-message"
            label={intl.formatMessage({ id: "dialogs.schedule.email.message.label" })}
            autocomplete="off"
            placeholder={intl.formatMessage({
                id: "dialogs.schedule.email.message.placeholder",
            })}
            rows={3}
            onChange={handleOnTitleChange}
            value={value}
            onFocus={handleFocus}
            onBlur={validateInput}
            validationError={validationError}
            hasError={!!validationError}
        />
    );
};
