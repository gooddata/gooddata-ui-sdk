// (C) 2007-2026 GoodData Corporation

import cx from "classnames";

/**
 * Props for TextFilterValidationMessages component.
 *
 * @alpha
 */
export interface ITextFilterValidationMessagesProps {
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

    /**
     * Optional id used for description.
     */
    descriptionId?: string;

    /**
     * Optional error text.
     */
    errorText?: string;
}

/**
 * Displays validation error and warning messages for the text filter body.
 *
 * @alpha
 */
export function TextFilterValidationMessages(props: ITextFilterValidationMessagesProps) {
    const {
        hasLiteralEmptyError,
        hasValuesEmptyError,
        hasValuesLimitReachedWarning,
        hasValuesLimitExceededError,
        descriptionId,
        errorText,
    } = props;

    if (!errorText) {
        return null;
    }

    return (
        <div
            id={descriptionId}
            className={cx("gd-text-filter-body__error", {
                "s-text-filter-input-error-message": hasLiteralEmptyError || hasValuesEmptyError,
                "gd-text-filter-body__error--limit-exceeded s-text-filter-values-limit-error":
                    hasValuesLimitExceededError,
                "gd-text-filter-body__error--limit s-text-filter-values-limit-warning":
                    hasValuesLimitReachedWarning && !hasValuesLimitExceededError,
            })}
        >
            {errorText}
        </div>
    );
}
