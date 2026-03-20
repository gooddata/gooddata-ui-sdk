// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { ValidationContextStore } from "@gooddata/sdk-ui";
import { Checkbox, Input, UiLink, isEnterKey, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { ArbitraryValuesInput } from "./ArbitraryValuesInput.js";
import { ArbitraryValuesTooltip } from "./ArbitraryValuesTooltip.js";
import { TextFilterOperatorDropdown } from "./TextFilterOperatorDropdown.js";
import { TextFilterStateSummary } from "./TextFilterStateSummary.js";
import { TextFilterValidationMessages } from "./TextFilterValidationMessages.js";
import { type ITextFilterBodyProps } from "./types.js";
import { useTextFilterBodyTexts } from "./useTextFilterBodyTexts.js";
import { useTextFilterBodyValidation } from "./useTextFilterBodyValidation.js";
import { useAttributeFilterDropdownHeader } from "../../hooks/useAttributeFilterDropdownHeader.js";
import { isAllOperator, isMatchOperator } from "../../textFilterOperatorUtils.js";
import { AttributeFilterDropdownHeader } from "../Dropdown/AttributeFilterDropdownHeader.js";

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

    const { showFilterHeader, headerProps } = useAttributeFilterDropdownHeader();

    const isArbitraryOperator = operator === "is" || operator === "isNot";
    const isAll = isAllOperator(operator);

    const handleLiteralChange = useCallback(
        (value: string | number) => {
            onLiteralChange?.(String(value));
        },
        [onLiteralChange],
    );

    const intl = useIntl();
    const { arbitraryValuePlaceholder, matchValuePlaceholder, arbitraryFilterValue, matchFilterValue } =
        useTextFilterBodyTexts();
    const operatorSelectId = useIdPrefixed("text-filter-operator-select");
    const valuesInputId = useIdPrefixed("text-filter-values-input");
    const literalInputId = useIdPrefixed("text-filter-literal-input");
    const { validationContextValue, describedByFromValidation, hasErrorInValidation } =
        useTextFilterBodyValidation({
            operator,
            hasLiteralEmptyError,
            hasValuesEmptyError,
            hasValuesLimitReachedWarning,
            hasValuesLimitExceededError,
        });

    const { getInvalidDatapoints } = validationContextValue;
    const invalidDatapoint = getInvalidDatapoints()[0];
    const inputErrorId = invalidDatapoint?.id ?? "";

    const clearAllValues = useCallback(() => {
        if (!disabled) {
            onValuesChange?.([]);
        }
    }, [disabled, onValuesChange]);

    return (
        <>
            {showFilterHeader ? <AttributeFilterDropdownHeader {...headerProps} /> : null}
            <ValidationContextStore value={validationContextValue}>
                <div className="gd-text-filter-body s-text-filter-body">
                    <div className="gd-text-filter-body__operator">
                        <label htmlFor={operatorSelectId} className="gd-text-filter-body__label">
                            <FormattedMessage id="attributeFilter.text.condition" />
                        </label>
                        <TextFilterOperatorDropdown
                            operator={operator}
                            onOperatorChange={onOperatorChange}
                            disabled={disabled}
                            availableTextModes={availableTextModes}
                            controlId={operatorSelectId}
                        />
                    </div>

                    {!isAll && (
                        <div className="gd-text-filter-body__values">
                            <div
                                className={cx("gd-text-filter-body__values-header", {
                                    "gd-text-filter-body__values-header--disabled": disabled,
                                })}
                            >
                                <label
                                    htmlFor={isArbitraryOperator ? valuesInputId : literalInputId}
                                    className={cx("gd-text-filter-body__label", {
                                        "gd-text-filter-body__label-with-help": isArbitraryOperator,
                                    })}
                                >
                                    {isArbitraryOperator ? arbitraryFilterValue : matchFilterValue}
                                    {isArbitraryOperator ? <ArbitraryValuesTooltip /> : null}
                                </label>
                                {isArbitraryOperator && values.length > 0 ? (
                                    <UiLink
                                        variant="secondary"
                                        role="button"
                                        onClick={clearAllValues}
                                        onKeyDown={(event) => {
                                            if (isEnterKey(event)) {
                                                event.preventDefault();
                                                clearAllValues();
                                            }
                                        }}
                                        aria-label={intl.formatMessage({
                                            id: "attributeFilter.text.values.clearAll",
                                        })}
                                        aria-disabled={disabled}
                                        tabIndex={disabled ? -1 : 0}
                                        dataTestId="s-text-filter-clear-all"
                                    >
                                        <FormattedMessage id="attributeFilter.text.values.clearAll" />
                                    </UiLink>
                                ) : null}
                            </div>

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
                                    inputId={valuesInputId}
                                    ariaDescribedBy={describedByFromValidation}
                                />
                            ) : (
                                <Input
                                    id={literalInputId}
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
                                    accessibilityConfig={{
                                        ariaDescribedBy: describedByFromValidation,
                                        ariaInvalid: hasErrorInValidation || undefined,
                                    }}
                                />
                            )}

                            <TextFilterValidationMessages
                                errorText={invalidDatapoint?.message}
                                descriptionId={inputErrorId}
                                hasLiteralEmptyError={hasLiteralEmptyError}
                                hasValuesEmptyError={hasValuesEmptyError}
                                hasValuesLimitReachedWarning={hasValuesLimitReachedWarning}
                                hasValuesLimitExceededError={hasValuesLimitExceededError}
                            />
                        </div>
                    )}

                    {/* Case sensitivity - only for non-arbitrary operators */}
                    {isMatchOperator(operator) ? (
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
                    ) : null}

                    {isAll ? null : (
                        <TextFilterStateSummary operator={operator} values={values} literal={literal} />
                    )}
                </div>
            </ValidationContextStore>
        </>
    );
}
