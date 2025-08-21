// (C) 2025 GoodData Corporation
import React, { useCallback, useRef } from "react";

import { useIntl } from "react-intl";

import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { ErrorWrapper } from "../ErrorWrapper/ErrorWrapper.js";
import { Textarea } from "../Textarea.js";

const MAX_MESSAGE_LENGTH = 10000;

interface IMessageFormProps {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
}

export function MessageForm({ value, onChange }: IMessageFormProps) {
    const { formatMessage } = useIntl();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "MessageForm" }));
    const { setInvalidDatapoints, getInvalidDatapoints, isValid } = validationContextValue;
    const invalidDatapoint = getInvalidDatapoints()[0];

    const labelId = useIdPrefixed("label");
    const errorId = useIdPrefixed("error");

    const setHasError = React.useCallback(
        (hasError: boolean) => {
            if (!hasError) {
                setInvalidDatapoints(() => []);
                return;
            }

            setInvalidDatapoints(() => [
                createInvalidDatapoint({
                    id: errorId,
                    message: formatMessage(
                        { id: "dialogs.schedule.error.too_long" },
                        { value: MAX_MESSAGE_LENGTH },
                    ),
                }),
            ]);
        },
        [errorId, formatMessage, setInvalidDatapoints],
    );

    const handleFocus = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
        event.target.select(); // Selects all text on focus
    }, []);

    const isValueValid = useCallback((value: string) => {
        return value.length <= MAX_MESSAGE_LENGTH;
    }, []);

    const handleOnTitleChange = useCallback(
        (value: string) => {
            const validationResult = isValueValid(value);
            if (!isValid) {
                setHasError(!validationResult);
            }
            onChange(value, validationResult);
        },
        [isValueValid, isValid, onChange, setHasError],
    );

    const handleOnBlur = useCallback(
        (value: string) => {
            setHasError(!isValueValid(value));
        },
        [setHasError, isValueValid],
    );

    return (
        <ValidationContextStore value={validationContextValue}>
            <ErrorWrapper
                errorId={errorId}
                errorMessage={invalidDatapoint?.message ?? null}
                label={formatMessage({ id: "dialogs.schedule.email.message.label" })}
                labelId={labelId}
                className="gd-input-component gd-textarea-component gd-notifications-channels-dialog-message s-gd-notifications-channels-dialog-message"
                labelWrapperClassName="gd-notifications-channels-dialog-message-content"
                errorClassName="gd-notifications-channels-dialog-message-error"
            >
                <Textarea
                    id={labelId}
                    ref={textareaRef}
                    autocomplete="off"
                    placeholder={formatMessage({
                        id: "dialogs.schedule.email.message.placeholder",
                    })}
                    rows={3}
                    onChange={handleOnTitleChange}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleOnBlur}
                    validationError={invalidDatapoint?.message ?? null}
                    hasError={!isValid}
                    accessibilityConfig={{
                        ariaDescribedBy: isValid ? undefined : errorId,
                    }}
                />
            </ErrorWrapper>
        </ValidationContextStore>
    );
}
