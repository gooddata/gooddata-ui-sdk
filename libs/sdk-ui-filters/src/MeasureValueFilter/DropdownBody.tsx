// (C) 2019-2025 GoodData Corporation
import React, { memo, useCallback, useState } from "react";

import { useIntl } from "react-intl";

import { isComparisonConditionOperator, isRangeConditionOperator } from "@gooddata/sdk-model";
import { ISeparators, IntlWrapper } from "@gooddata/sdk-ui";
import { Button } from "@gooddata/sdk-ui-kit";

import ComparisonInput from "./ComparisonInput.js";
import OperatorDropdown from "./OperatorDropdown.js";
import RangeInput from "./RangeInput.js";
import TreatNullValuesAsZeroCheckbox from "./TreatNullValuesAsZeroCheckbox.js";
import { IMeasureValueFilterValue, MeasureValueFilterOperator } from "./types.js";
import { WarningMessage } from "./typings.js";
import { WarningMessageComponent } from "./WarningMessage.js";

interface IDropdownBodyProps {
    operator: MeasureValueFilterOperator;
    value: IMeasureValueFilterValue;
    usePercentage?: boolean;
    warningMessage?: WarningMessage;
    locale?: string;
    disableAutofocus?: boolean;
    onCancel?: () => void;
    onApply: (
        operator: MeasureValueFilterOperator | null,
        value: IMeasureValueFilterValue,
        treatNullValuesAsZero: boolean,
    ) => void;
    separators?: ISeparators;
    displayTreatNullAsZeroOption?: boolean;
    treatNullAsZeroValue?: boolean;
    valuePrecision?: number;
    enableOperatorSelection?: boolean;
}

interface IDropdownBodyState {
    operator: MeasureValueFilterOperator;
    value: IMeasureValueFilterValue;
    enabledTreatNullValuesAsZero: boolean;
}

const DefaultValuePrecision = 6;

export const DropdownBodyWithIntl = memo(function DropdownBodyWithIntl(props: IDropdownBodyProps) {
    const intl = useIntl();

    const {
        operator: propsOperator,
        value,
        usePercentage,
        treatNullAsZeroValue,
        valuePrecision = DefaultValuePrecision,
    } = props;

    const trimToPrecision = useCallback(
        (n: number): number => {
            if (!n) {
                return n;
            }
            return parseFloat(n.toFixed(valuePrecision));
        },
        [valuePrecision],
    );

    const fromPercentToDecimal = useCallback((n: number): number => (n ? n / 100 : n), []);

    const fromDecimalToPercent = useCallback((n: number): number => (n ? n * 100 : n), []);

    const convertToPercentageValue = useCallback(
        (value: IMeasureValueFilterValue, operator: string): IMeasureValueFilterValue => {
            if (!value) {
                return value;
            }

            return isComparisonConditionOperator(operator)
                ? { value: trimToPrecision(fromDecimalToPercent(value.value)) }
                : {
                      from: trimToPrecision(fromDecimalToPercent(value.from)),
                      to: trimToPrecision(fromDecimalToPercent(value.to)),
                  };
        },
        [trimToPrecision, fromDecimalToPercent],
    );

    const [state, setState] = useState<IDropdownBodyState>(() => ({
        operator: propsOperator || "ALL",
        value: (usePercentage ? convertToPercentageValue(value, propsOperator) : value) || {},
        enabledTreatNullValuesAsZero: treatNullAsZeroValue,
    }));

    const convertToRawValue = useCallback(
        (value: IMeasureValueFilterValue, operator: string): IMeasureValueFilterValue => {
            if (!value) {
                return value;
            }
            return isComparisonConditionOperator(operator)
                ? { value: trimToPrecision(fromPercentToDecimal(value.value)) }
                : {
                      from: trimToPrecision(fromPercentToDecimal(value.from)),
                      to: trimToPrecision(fromPercentToDecimal(value.to)),
                  };
        },
        [trimToPrecision, fromPercentToDecimal],
    );

    const isChanged = useCallback(
        () =>
            state.operator !== props.operator ||
            state.enabledTreatNullValuesAsZero !== props.treatNullAsZeroValue,
        [state.operator, state.enabledTreatNullValuesAsZero, props.operator, props.treatNullAsZeroValue],
    );

    const isApplyButtonDisabledForComparison = useCallback(() => {
        const { value: stateValue = null } = state.value;

        if (stateValue === null) {
            return true;
        }

        if (props.value === null || isChanged()) {
            return false;
        }

        if (props.usePercentage) {
            return trimToPrecision(fromPercentToDecimal(stateValue)) === props.value.value;
        }

        return stateValue === props.value.value;
    }, [state.value, props.value, props.usePercentage, isChanged, trimToPrecision, fromPercentToDecimal]);

    const isApplyButtonDisabledForRange = useCallback(() => {
        const { from = null, to = null } = state.value;

        if (from === null || to === null) {
            return true;
        }

        if (props.value === null || isChanged()) {
            return false;
        }

        if (props.usePercentage) {
            return (
                trimToPrecision(fromPercentToDecimal(from)) === props.value.from &&
                trimToPrecision(fromPercentToDecimal(to)) === props.value.to
            );
        }

        return from === props.value.from && to === props.value.to;
    }, [state.value, props.value, props.usePercentage, isChanged, trimToPrecision, fromPercentToDecimal]);

    const isApplyButtonDisabledForAll = useCallback(() => {
        return propsOperator === "ALL";
    }, [propsOperator]);

    const isApplyButtonDisabled = useCallback(() => {
        const { operator } = state;

        if (isComparisonConditionOperator(operator)) {
            return isApplyButtonDisabledForComparison();
        }

        if (isRangeConditionOperator(operator)) {
            return isApplyButtonDisabledForRange();
        }

        return isApplyButtonDisabledForAll();
    }, [
        state,
        isApplyButtonDisabledForComparison,
        isApplyButtonDisabledForRange,
        isApplyButtonDisabledForAll,
    ]);

    const handleOperatorSelection = useCallback(
        (operator: MeasureValueFilterOperator) => setState((prev) => ({ ...prev, operator })),
        [],
    );

    const handleValueChange = useCallback((value: number) => {
        setState((prev) => ({ ...prev, value: { ...prev.value, value } }));
    }, []);

    const handleFromChange = useCallback((from: number) => {
        setState((prev) => ({ ...prev, value: { ...prev.value, from } }));
    }, []);

    const handleToChange = useCallback((to: number) => {
        setState((prev) => ({ ...prev, value: { ...prev.value, to } }));
    }, []);

    const handleTreatNullAsZeroClicked = useCallback((checked: boolean) => {
        setState((prev) => ({ ...prev, enabledTreatNullValuesAsZero: checked }));
    }, []);

    const onApply = useCallback(() => {
        if (isApplyButtonDisabled()) {
            return;
        }

        const { enabledTreatNullValuesAsZero, operator: stateOperator, value: stateValue } = state;
        const { usePercentage } = props;

        const finalOperator = stateOperator === "ALL" ? null : stateOperator;
        const finalValue = usePercentage ? convertToRawValue(stateValue, stateOperator) : stateValue;

        props.onApply(finalOperator, finalValue, enabledTreatNullValuesAsZero);
    }, [isApplyButtonDisabled, state, props, convertToRawValue]);

    const renderInputSection = useCallback(() => {
        const { usePercentage, disableAutofocus, separators } = props;
        const {
            operator,
            value: { value = null, from = null, to = null },
        } = state;

        if (isComparisonConditionOperator(operator)) {
            return (
                <ComparisonInput
                    value={value}
                    usePercentage={usePercentage}
                    onValueChange={handleValueChange}
                    onEnterKeyPress={onApply}
                    disableAutofocus={disableAutofocus}
                    separators={separators}
                />
            );
        } else if (isRangeConditionOperator(operator)) {
            return (
                <RangeInput
                    from={from}
                    to={to}
                    usePercentage={usePercentage}
                    onFromChange={handleFromChange}
                    onToChange={handleToChange}
                    onEnterKeyPress={onApply}
                    disableAutofocus={disableAutofocus}
                    separators={separators}
                />
            );
        }

        return null;
    }, [props, state, handleValueChange, handleFromChange, handleToChange, onApply]);

    const { onCancel, warningMessage, displayTreatNullAsZeroOption, enableOperatorSelection } = props;
    const { operator, enabledTreatNullValuesAsZero } = state;

    return (
        <div className="gd-mvf-dropdown-body gd-dialog gd-dropdown overlay s-mvf-dropdown-body">
            <div className="gd-mvf-dropdown-content">
                {warningMessage ? (
                    <div className="gd-mvf-dropdown-section">
                        <WarningMessageComponent warningMessage={warningMessage} />
                    </div>
                ) : null}

                <div className="gd-mvf-dropdown-section">
                    <OperatorDropdown
                        onSelect={handleOperatorSelection}
                        operator={operator}
                        isDisabled={!enableOperatorSelection}
                    />
                </div>

                {operator !== "ALL" ? (
                    <div className="gd-mvf-dropdown-section">
                        {renderInputSection()}{" "}
                        {displayTreatNullAsZeroOption ? (
                            <TreatNullValuesAsZeroCheckbox
                                onChange={handleTreatNullAsZeroClicked}
                                checked={enabledTreatNullValuesAsZero}
                                intl={intl}
                            />
                        ) : null}
                    </div>
                ) : null}
            </div>
            <div className="gd-mvf-dropdown-footer">
                <Button
                    className="gd-button-secondary gd-button-small s-mvf-dropdown-cancel"
                    onClick={onCancel}
                    value={intl.formatMessage({ id: "cancel" })}
                />
                <Button
                    className="gd-button-action gd-button-small s-mvf-dropdown-apply"
                    onClick={onApply}
                    value={intl.formatMessage({ id: "apply" })}
                    disabled={isApplyButtonDisabled()}
                />
            </div>
        </div>
    );
});

export const DropdownBody = memo(function DropdownBody(props: IDropdownBodyProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <DropdownBodyWithIntl {...props} />
        </IntlWrapper>
    );
});
