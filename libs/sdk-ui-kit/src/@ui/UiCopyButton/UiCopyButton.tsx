// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type MessageParameters, useToastMessage } from "../../Messages/index.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";

/**
 * @internal
 */
export interface IUiCopyButtonProps {
    label?: string;
    successMessage?: MessageDescriptor;
    successMessageOptions?: MessageParameters;
    errorMessage?: MessageDescriptor;
    errorMessageOptions?: MessageParameters;
    clipboardContent: string;
}

const messages = defineMessages({
    copySuccess: {
        id: "copyButton.copy.success",
    },
    copyError: {
        id: "copyButton.copy.error",
    },
    copy: {
        id: "copyButton.copy",
    },
});

/**
 * @internal
 */
export function UiCopyButton({
    label,
    clipboardContent,
    successMessage,
    successMessageOptions,
    errorMessage,
    errorMessageOptions,
}: IUiCopyButtonProps) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();

    const onCopy = useCallback(() => {
        navigator.clipboard
            .writeText(clipboardContent)
            .then(() => {
                addSuccess(successMessage ?? messages.copySuccess, successMessageOptions);
            })
            .catch((e) => {
                addError(errorMessage ?? messages.copyError, errorMessageOptions);
                console.error("Failed copy content to clipboard", e);
            });
    }, [
        addError,
        addSuccess,
        clipboardContent,
        errorMessage,
        errorMessageOptions,
        successMessage,
        successMessageOptions,
    ]);

    return (
        <UiIconButton
            label={label ?? intl.formatMessage(messages.copy)}
            icon="copy"
            size="small"
            variant="tertiary"
            onClick={onCopy}
        />
    );
}
