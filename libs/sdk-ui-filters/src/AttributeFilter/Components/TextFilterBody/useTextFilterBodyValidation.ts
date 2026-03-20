// (C) 2007-2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IntlShape, useIntl } from "react-intl";

import { createInvalidDatapoint, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";

import { type ITextFilterBodyProps } from "./types.js";
import { MAX_SELECTION_SIZE } from "../../hooks/constants.js";

type ITextFilterBodyValidationParams = Pick<
    ITextFilterBodyProps,
    | "operator"
    | "hasLiteralEmptyError"
    | "hasValuesEmptyError"
    | "hasValuesLimitReachedWarning"
    | "hasValuesLimitExceededError"
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

const getTextFilterInvalidDatapoints = (messages: ITextFilterValidationMessages) => {
    return [
        messages.valuesEmpty
            ? createInvalidDatapoint({
                  message: messages.valuesEmpty,
                  severity: "error",
              })
            : undefined,
        messages.valuesLimitExceeded
            ? createInvalidDatapoint({
                  message: messages.valuesLimitExceeded,
                  severity: "error",
              })
            : undefined,
        messages.valuesLimitReachedWarning
            ? createInvalidDatapoint({
                  message: messages.valuesLimitReachedWarning,
                  severity: "warning",
              })
            : undefined,
        messages.literalEmpty
            ? createInvalidDatapoint({
                  message: messages.literalEmpty,
                  severity: "error",
              })
            : undefined,
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

        setInvalidDatapoints(() => getTextFilterInvalidDatapoints(messages));
    }, [
        hasLiteralEmptyError,
        hasValuesEmptyError,
        hasValuesLimitExceededError,
        hasValuesLimitReachedWarning,
        intl,
        isArbitraryOperator,
        setInvalidDatapoints,
    ]);

    const validationDatapoints = getInvalidDatapoints();
    const describedByFromValidation = useMemo(
        () => validationDatapoints.map((datapoint) => datapoint.id).join(" ") || undefined,
        [validationDatapoints],
    );
    const hasErrorInValidation = validationDatapoints.some((datapoint) => datapoint.severity === "error");

    return {
        validationContextValue,
        describedByFromValidation,
        hasErrorInValidation,
    };
}
