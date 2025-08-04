// (C) 2025 GoodData Corporation
import React, { useRef, useState, useCallback } from "react";
import { Textarea } from "../Textarea.js";
import { useIntl } from "react-intl";
import { ErrorWrapper } from "../ErrorWrapper/ErrorWrapper.js";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

const MAX_MESSAGE_LENGTH = 10000;

enum ScheduleEmailMessageErrorType {
    LONG_VALUE = "LONG_VALUE",
}

interface IMessageFormProps {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
}

export const MessageForm: React.FC<IMessageFormProps> = ({ value, onChange }) => {
    const intl = useIntl();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [messageError, setMessageError] = useState<string | null>(null);

    const labelId = useIdPrefixed("label");
    const errorId = useIdPrefixed("error");

    const errorMessage = intl.formatMessage(
        { id: "dialogs.schedule.error.too_long" },
        { value: MAX_MESSAGE_LENGTH },
    );

    const handleFocus = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.target.select(); // Selects all text on focus
    }, []);

    const validate = useCallback((value: string) => {
        if (value.length > MAX_MESSAGE_LENGTH) {
            return ScheduleEmailMessageErrorType.LONG_VALUE;
        }
        return null;
    }, []);

    const handleOnTitleChange = useCallback(
        (value: string) => {
            const validationResult = validate(value);
            if (messageError) {
                if (validationResult) {
                    setMessageError(errorMessage);
                } else {
                    setMessageError(null);
                }
            }
            onChange(value, !validationResult);
        },
        [messageError, validate, errorMessage, onChange],
    );

    const handleOnBlur = useCallback(
        (value: string) => {
            const validationResult = validate(value);
            if (validationResult) {
                setMessageError(errorMessage);
            } else {
                setMessageError(null);
            }
        },
        [errorMessage, validate],
    );

    return (
        <ErrorWrapper
            errorId={errorId}
            errorMessage={messageError}
            label={intl.formatMessage({ id: "dialogs.schedule.email.message.label" })}
            labelId={labelId}
            className="gd-input-component gd-textarea-component gd-notifications-channels-dialog-message s-gd-notifications-channels-dialog-message"
            labelWrapperClassName="gd-notifications-channels-dialog-message-content"
            errorClassName="gd-notifications-channels-dialog-message-error"
        >
            <Textarea
                id={labelId}
                ref={textareaRef}
                autocomplete="off"
                placeholder={intl.formatMessage({
                    id: "dialogs.schedule.email.message.placeholder",
                })}
                rows={3}
                onChange={handleOnTitleChange}
                value={value}
                onFocus={handleFocus}
                onBlur={handleOnBlur}
                validationError={messageError}
                hasError={!!messageError}
                accessibilityConfig={{
                    ariaDescribedBy: messageError ? errorId : undefined,
                }}
            />
        </ErrorWrapper>
    );
};
