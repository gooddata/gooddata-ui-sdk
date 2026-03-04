// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { Checkbox, Input } from "@gooddata/sdk-ui-kit";

import { ArbitraryValuesInput } from "./ArbitraryValuesInput.js";
import { ArbitraryValuesTooltip } from "./ArbitraryValuesTooltip.js";
import { TextFilterOperatorDropdown } from "./TextFilterOperatorDropdown.js";
import { TextFilterStateSummary } from "./TextFilterStateSummary.js";
import { TextFilterValidationMessages } from "./TextFilterValidationMessages.js";
import { useTextFilterBodyTexts } from "./useTextFilterBodyTexts.js";
import { type AttributeFilterTextMode } from "../../filterModeTypes.js";
import { type TextFilterOperator } from "../../textFilterOperatorUtils.js";

/**
 * Props for TextFilterBody component.
 *
 * @alpha
 */
export interface ITextFilterBodyProps {
    /**
     * Current operator
     */
    operator: TextFilterOperator;

    /**
     * Current values (chips for is/is not) or literal (single input for others)
     */
    values: string[];

    /**
     * Literal for like operators (when not using chips)
     */
    literal: string;

    /**
     * Case sensitive flag for like operators
     */
    caseSensitive: boolean;

    /**
     * Callback when operator changes
     */
    onOperatorChange?: (operator: TextFilterOperator) => void;

    /**
     * Callback when values change (for is/is not)
     */
    onValuesChange?: (values: string[]) => void;

    /**
     * Callback when values input loses focus.
     */
    onValuesBlur?: () => void;

    /**
     * Callback when literal changes (for other operators)
     */
    onLiteralChange?: (literal: string) => void;

    /**
     * Callback when literal field loses focus.
     */
    onLiteralBlur?: () => void;

    /**
     * Callback to toggle case sensitivity
     */
    onToggleCaseSensitive?: () => void;

    /**
     * True if empty-literal validation should be shown.
     */
    hasLiteralEmptyError?: boolean;

    /**
     * True if empty-values validation should be shown.
     */
    hasValuesEmptyError?: boolean;

    /**
     * True when at value limit (values.length === max) - warning shown, Apply enabled.
     */
    hasValuesLimitReachedWarning?: boolean;

    /**
     * True when value limit exceeded (truncated) - error shown, Apply disabled.
     */
    hasValuesLimitExceededError?: boolean;

    /**
     * Attribute title for context
     */
    attributeTitle: string;

    /**
     * Whether the filter is disabled
     */
    disabled?: boolean;

    /**
     * Available text sub-modes.
     */
    availableTextModes?: AttributeFilterTextMode[];

    /**
     * Autocomplete suggestions for the values input (is / is not operators).
     * Populated from the loaded attribute elements so the user can pick known values.
     */
    autocompleteOptions?: string[];

    /**
     * Optional callback to trigger a search for autocomplete suggestions.
     * When provided, this will be called as the user types to fetch matching elements
     * from the backend.
     */
    onAutocompleteSearch?: (searchString: string) => void;

    /**
     * Whether autocomplete is currently loading results from the backend.
     */
    isAutocompleteLoading?: boolean;
}

/**
 * Unified text filter body component.
 * Adapts UI based on operator: chips for "is/is not", single input for like operators.
 *
 * @alpha
 */
export function TextFilterBody(props: ITextFilterBodyProps) {
    const {
        operator,
        values,
        literal,
        caseSensitive,
        onOperatorChange,
        onValuesChange,
        onValuesBlur,
        onLiteralChange,
        onLiteralBlur,
        onToggleCaseSensitive,
        hasLiteralEmptyError,
        hasValuesEmptyError,
        hasValuesLimitReachedWarning,
        hasValuesLimitExceededError,
        disabled,
        availableTextModes,
        autocompleteOptions,
        onAutocompleteSearch,
        isAutocompleteLoading,
    } = props;

    const isArbitraryOperator = operator === "is" || operator === "isNot";

    const handleLiteralChange = useCallback(
        (value: string | number) => {
            onLiteralChange?.(String(value));
        },
        [onLiteralChange],
    );

    const intl = useIntl();
    const { arbitraryValuePlaceholder, matchValuePlaceholder, arbitraryFilterValue, matchFilterValue } =
        useTextFilterBodyTexts();

    return (
        <div className="gd-text-filter-body s-text-filter-body">
            <div className="gd-text-filter-body__operator">
                <label className="gd-text-filter-body__label">
                    <FormattedMessage id="attributeFilter.text.condition" />
                </label>
                <TextFilterOperatorDropdown
                    operator={operator}
                    onOperatorChange={onOperatorChange}
                    disabled={disabled}
                    availableTextModes={availableTextModes}
                />
            </div>

            <div className="gd-text-filter-body__values">
                <label
                    className={cx("gd-text-filter-body__label", {
                        "gd-text-filter-body__label-with-help": isArbitraryOperator,
                    })}
                >
                    <FormattedMessage id={isArbitraryOperator ? arbitraryFilterValue : matchFilterValue} />
                    {isArbitraryOperator ? <ArbitraryValuesTooltip /> : null}
                </label>

                {isArbitraryOperator ? (
                    <ArbitraryValuesInput
                        values={values}
                        onValuesChange={onValuesChange}
                        onBlur={onValuesBlur}
                        hasEmptyError={hasValuesEmptyError}
                        hasValuesLimitReachedWarning={hasValuesLimitReachedWarning}
                        hasValuesLimitExceededError={hasValuesLimitExceededError}
                        placeholder={arbitraryValuePlaceholder}
                        disabled={disabled}
                        emptyValueDisplay={`(${intl.formatMessage({ id: "empty_value" })})`}
                        autocompleteOptions={autocompleteOptions}
                        onAutocompleteSearch={onAutocompleteSearch}
                        isAutocompleteLoading={isAutocompleteLoading}
                    />
                ) : (
                    <Input
                        type="text"
                        className={cx("gd-text-filter-body__input s-text-filter-input", {
                            "gd-text-filter-body__input--error s-text-filter-input-error":
                                hasLiteralEmptyError,
                        })}
                        hasError={hasLiteralEmptyError}
                        value={literal}
                        onChange={handleLiteralChange}
                        onBlur={onLiteralBlur}
                        placeholder={matchValuePlaceholder}
                        disabled={disabled}
                    />
                )}
                <TextFilterValidationMessages
                    isArbitraryOperator={isArbitraryOperator}
                    hasLiteralEmptyError={hasLiteralEmptyError}
                    hasValuesEmptyError={hasValuesEmptyError}
                    hasValuesLimitReachedWarning={hasValuesLimitReachedWarning}
                    hasValuesLimitExceededError={hasValuesLimitExceededError}
                />
            </div>

            {/* Case sensitivity - only for non-arbitrary operators */}
            {!isArbitraryOperator && (
                <div className="gd-text-filter-body__options">
                    <Checkbox
                        value={caseSensitive}
                        text={intl.formatMessage({
                            id: "attributeFilter.text.caseSensitive",
                        })}
                        onChange={onToggleCaseSensitive}
                        disabled={disabled}
                    />
                </div>
            )}

            <TextFilterStateSummary operator={operator} values={values} literal={literal} />
        </div>
    );
}
