// (C) 2007-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { MAX_SELECTION_SIZE } from "../../hooks/constants.js";

/**
 * Props for TextFilterValidationMessages component.
 *
 * @alpha
 */
export interface ITextFilterValidationMessagesProps {
    /**
     * Whether the current operator is an arbitrary operator (is/isNot).
     */
    isArbitraryOperator: boolean;

    /**
     * True if empty-literal validation should be shown.
     */
    hasLiteralEmptyError?: boolean;

    /**
     * True if empty-values validation should be shown.
     */
    hasValuesEmptyError?: boolean;

    /**
     * True when at value limit (values.length === max) — warning shown, Apply enabled.
     */
    hasValuesLimitReachedWarning?: boolean;

    /**
     * True when value limit exceeded (truncated) — error shown, Apply disabled.
     */
    hasValuesLimitExceededError?: boolean;
}

/**
 * Displays validation error and warning messages for the text filter body.
 *
 * @alpha
 */
export function TextFilterValidationMessages(props: ITextFilterValidationMessagesProps) {
    const {
        isArbitraryOperator,
        hasLiteralEmptyError,
        hasValuesEmptyError,
        hasValuesLimitReachedWarning,
        hasValuesLimitExceededError,
    } = props;

    return (
        <>
            {isArbitraryOperator && hasValuesEmptyError ? (
                <div className="gd-text-filter-body__error s-text-filter-input-error-message">
                    <FormattedMessage id="attributeFilter.text.validation.valueCannotBeEmpty" />
                </div>
            ) : null}
            {isArbitraryOperator && hasValuesLimitExceededError ? (
                <div className="gd-text-filter-body__error gd-text-filter-body__error--limit-exceeded s-text-filter-values-limit-error">
                    <FormattedMessage
                        id="attributeFilter.text.validation.valuesLimitExceeded"
                        values={{ maxValues: MAX_SELECTION_SIZE }}
                    />
                </div>
            ) : null}
            {isArbitraryOperator && hasValuesLimitReachedWarning && !hasValuesLimitExceededError ? (
                <div className="gd-text-filter-body__error gd-text-filter-body__error--limit s-text-filter-values-limit-warning">
                    <FormattedMessage
                        id="attributeFilter.text.validation.valuesLimitReached"
                        values={{ maxValues: MAX_SELECTION_SIZE }}
                    />
                </div>
            ) : null}
            {!isArbitraryOperator && hasLiteralEmptyError ? (
                <div className="gd-text-filter-body__error s-text-filter-input-error-message">
                    <FormattedMessage id="attributeFilter.text.validation.valueCannotBeEmpty" />
                </div>
            ) : null}
        </>
    );
}
