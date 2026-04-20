// (C) 2007-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IntlShape, useIntl } from "react-intl";

import { createInvalidDatapoint, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";

import { MAX_SELECTION_SIZE } from "../../hooks/constants.js";
import { type ITextFilterBodyProps } from "./types.js";

type ITextFilterBodyValidationParams = Pick<
    ITextFilterBodyProps,
    | "operator"
    | "hasLiteralEmptyError"
    | "hasValuesEmptyError"
    | "hasValuesLimitReachedWarning"
    | "hasValuesLimitExceededError"
    | "validationMessageId"
>;

type ITextFilterValidationMessages = {
    literalEmpty?: string;
    valuesEmpty?: string;
    valuesLimitExceeded?: string;
    valuesLimitReachedWarning?: string;
};

const getTextFilterValidationMessages = (
    isArbitraryOperator: boolean,
    {
        hasLiteralEmptyError,
        hasValuesEmptyError,
        hasValuesLimitReachedWarning,
        hasValuesLimitExceededError,
    }: Pick<
        ITextFilterBodyValidationParams,
        | "hasLiteralEmptyError"
        | "hasValuesEmptyError"
        | "hasValuesLimitReachedWarning"
        | "hasValuesLimitExceededError"
    >,
    intl: IntlShape,
): ITextFilterValidationMessages => {
    const valueCannotBeEmptyMessage = intl.formatMessage({
        id: "attributeFilter.text.validation.valueCannotBeEmpty",
    });
    const valuesLimitExceededMessage = intl.formatMessage(
        {
            id: "attributeFilter.text.validation.valuesLimitExceeded",
        },
        { maxValues: MAX_SELECTION_SIZE },
    );
    const valuesLimitReachedMessage = intl.formatMessage(
        {
            id: "attributeFilter.text.validation.valuesLimitReached",
        },
        { maxValues: MAX_SELECTION_SIZE },
    );

    if (!isArbitraryOperator) {
        return {
            literalEmpty: hasLiteralEmptyError ? valueCannotBeEmptyMessage : undefined,
        };
    }

    return {
        valuesEmpty: hasValuesEmptyError ? valueCannotBeEmptyMessage : undefined,
        valuesLimitExceeded: hasValuesLimitExceededError ? valuesLimitExceededMessage : undefined,
        valuesLimitReachedWarning:
            hasValuesLimitReachedWarning && !hasValuesLimitExceededError
                ? valuesLimitReachedMessage
                : undefined,
    };
};

const getTextFilterInvalidDatapoints = (
    messages: ITextFilterValidationMessages,
    validationMessageId?: string,
) => {
    const createTextFilterInvalidDatapoint = (message: string, severity: "error" | "warning") =>
        createInvalidDatapoint(
            validationMessageId ? { id: validationMessageId, message, severity } : { message, severity },
        );

    return [
        messages.valuesEmpty ? createTextFilterInvalidDatapoint(messages.valuesEmpty, "error") : undefined,
        messages.valuesLimitExceeded
            ? createTextFilterInvalidDatapoint(messages.valuesLimitExceeded, "error")
            : undefined,
        messages.valuesLimitReachedWarning
            ? createTextFilterInvalidDatapoint(messages.valuesLimitReachedWarning, "warning")
            : undefined,
        messages.literalEmpty ? createTextFilterInvalidDatapoint(messages.literalEmpty, "error") : undefined,
    ];
};

/**
 * Encapsulates ValidationContextStore wiring for TextFilterBody.
 *
 * @internal
 */
export function useTextFilterBodyValidation(params: ITextFilterBodyValidationParams) {
    const {
        operator,
        hasLiteralEmptyError,
        hasValuesEmptyError,
        hasValuesLimitReachedWarning,
        hasValuesLimitExceededError,
        validationMessageId,
    } = params;
    const isArbitraryOperator = operator === "is" || operator === "isNot";
    const intl = useIntl();

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "TextFilterBody" }));
    const { setInvalidDatapoints, getInvalidDatapoints } = validationContextValue;

    useEffect(() => {
        const messages = getTextFilterValidationMessages(
            isArbitraryOperator,
            {
                hasLiteralEmptyError,
                hasValuesEmptyError,
                hasValuesLimitReachedWarning,
                hasValuesLimitExceededError,
            },
            intl,
        );

        setInvalidDatapoints(() => getTextFilterInvalidDatapoints(messages, validationMessageId));
    }, [
        hasLiteralEmptyError,
        hasValuesEmptyError,
        hasValuesLimitExceededError,
        hasValuesLimitReachedWarning,
        intl,
        isArbitraryOperator,
        setInvalidDatapoints,
        validationMessageId,
    ]);

    const validationDatapoints = getInvalidDatapoints();
    const describedByFromValidation = useMemo(
        () =>
            validationDatapoints
                .map((datapoint) => datapoint.id)
                .filter(Boolean)
                .join(" ") || undefined,
        [validationDatapoints],
    );
    const hasErrorInValidation = validationDatapoints.some((datapoint) => datapoint.severity === "error");

    return {
        validationContextValue,
        describedByFromValidation,
        hasErrorInValidation,
    };
}
