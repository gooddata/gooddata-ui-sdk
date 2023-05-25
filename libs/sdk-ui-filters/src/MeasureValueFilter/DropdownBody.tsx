// (C) 2019-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

import { IntlWrapper, ISeparators } from "@gooddata/sdk-ui";
import OperatorDropdown from "./OperatorDropdown.js";
import RangeInput from "./RangeInput.js";
import ComparisonInput from "./ComparisonInput.js";
import { IMeasureValueFilterValue, MeasureValueFilterOperator } from "./types.js";
import { isComparisonConditionOperator, isRangeConditionOperator } from "@gooddata/sdk-model";
import TreatNullValuesAsZeroCheckbox from "./TreatNullValuesAsZeroCheckbox.js";
import { WarningMessage } from "./typings.js";
import { WarningMessageComponent } from "./WarningMessage.js";

interface IDropdownBodyOwnProps {
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

type IDropdownBodyProps = IDropdownBodyOwnProps & WrappedComponentProps;

interface IDropdownBodyState {
    operator: MeasureValueFilterOperator;
    value: IMeasureValueFilterValue;
    enabledTreatNullValuesAsZero: boolean;
}

const DefaultValuePrecision = 6;

class DropdownBodyWrapped extends React.PureComponent<IDropdownBodyProps, IDropdownBodyState> {
    constructor(props: IDropdownBodyProps) {
        super(props);

        const { operator, value, usePercentage, treatNullAsZeroValue } = props;

        this.state = {
            operator: operator || "ALL",
            value: (usePercentage ? this.convertToPercentageValue(value, operator) : value) || {},
            enabledTreatNullValuesAsZero: treatNullAsZeroValue,
        };
    }

    public render() {
        const { onCancel, warningMessage, displayTreatNullAsZeroOption, enableOperatorSelection, intl } =
            this.props;
        const { operator, enabledTreatNullValuesAsZero } = this.state;

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
                            onSelect={this.handleOperatorSelection}
                            operator={operator}
                            isDisabled={!enableOperatorSelection}
                        />
                    </div>

                    {operator !== "ALL" ? (
                        <div className="gd-mvf-dropdown-section">
                            {this.renderInputSection()}{" "}
                            {displayTreatNullAsZeroOption ? (
                                <TreatNullValuesAsZeroCheckbox
                                    onChange={this.handleTreatNullAsZeroClicked}
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
                        onClick={this.onApply}
                        value={intl.formatMessage({ id: "apply" })}
                        disabled={this.isApplyButtonDisabled()}
                    />
                </div>
            </div>
        );
    }

    private renderInputSection = () => {
        const { usePercentage, disableAutofocus, separators } = this.props;
        const {
            operator,
            value: { value = null, from = null, to = null },
        } = this.state;

        if (isComparisonConditionOperator(operator)) {
            return (
                <ComparisonInput
                    value={value}
                    usePercentage={usePercentage}
                    onValueChange={this.handleValueChange}
                    onEnterKeyPress={this.onApply}
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
                    onFromChange={this.handleFromChange}
                    onToChange={this.handleToChange}
                    onEnterKeyPress={this.onApply}
                    disableAutofocus={disableAutofocus}
                    separators={separators}
                />
            );
        }

        return null;
    };

    private isApplyButtonDisabledForComparison() {
        const { value = null } = this.state.value;

        if (value === null) {
            return true;
        }

        if (this.props.value === null || this.isChanged()) {
            return false;
        }

        if (this.props.usePercentage) {
            return this.trimToPrecision(this.fromPercentToDecimal(value)) === this.props.value.value;
        }

        return value === this.props.value.value;
    }

    private isApplyButtonDisabledForRange() {
        const { from = null, to = null } = this.state.value;

        if (from === null || to === null) {
            return true;
        }

        if (this.props.value === null || this.isChanged()) {
            return false;
        }

        if (this.props.usePercentage) {
            return (
                this.trimToPrecision(this.fromPercentToDecimal(from)) === this.props.value.from &&
                this.trimToPrecision(this.fromPercentToDecimal(to)) === this.props.value.to
            );
        }

        return from === this.props.value.from && to === this.props.value.to;
    }

    private isChanged = () =>
        this.state.operator !== this.props.operator ||
        this.state.enabledTreatNullValuesAsZero !== this.props.treatNullAsZeroValue;

    private isApplyButtonDisabledForAll() {
        return this.props.operator === "ALL";
    }

    private isApplyButtonDisabled = () => {
        const { operator } = this.state;

        if (isComparisonConditionOperator(operator)) {
            return this.isApplyButtonDisabledForComparison();
        }

        if (isRangeConditionOperator(operator)) {
            return this.isApplyButtonDisabledForRange();
        }

        return this.isApplyButtonDisabledForAll();
    };

    private handleOperatorSelection = (operator: MeasureValueFilterOperator) => this.setState({ operator });

    private handleValueChange = (value: number) => {
        this.setState({ value: { ...this.state.value, value } });
    };

    private handleFromChange = (from: number) => {
        this.setState({ value: { ...this.state.value, from } });
    };

    private handleToChange = (to: number) => {
        this.setState({ value: { ...this.state.value, to } });
    };

    private handleTreatNullAsZeroClicked = (checked: boolean) => {
        this.setState({ enabledTreatNullValuesAsZero: checked });
    };

    private trimToPrecision = (n: number): number => {
        const { valuePrecision = DefaultValuePrecision } = this.props;
        if (!n) {
            return n;
        }
        return parseFloat(n.toFixed(valuePrecision));
    };

    private fromPercentToDecimal = (n: number): number => (n ? n / 100 : n);

    private fromDecimalToPercent = (n: number): number => (n ? n * 100 : n);

    private convertToRawValue = (
        value: IMeasureValueFilterValue,
        operator: string,
    ): IMeasureValueFilterValue => {
        if (!value) {
            return value;
        }
        return isComparisonConditionOperator(operator)
            ? { value: this.trimToPrecision(this.fromPercentToDecimal(value.value)) }
            : {
                  from: this.trimToPrecision(this.fromPercentToDecimal(value.from)),
                  to: this.trimToPrecision(this.fromPercentToDecimal(value.to)),
              };
    };

    private convertToPercentageValue = (
        value: IMeasureValueFilterValue,
        operator: string,
    ): IMeasureValueFilterValue => {
        if (!value) {
            return value;
        }

        return isComparisonConditionOperator(operator)
            ? { value: this.trimToPrecision(this.fromDecimalToPercent(value.value)) }
            : {
                  from: this.trimToPrecision(this.fromDecimalToPercent(value.from)),
                  to: this.trimToPrecision(this.fromDecimalToPercent(value.to)),
              };
    };

    private onApply = () => {
        if (this.isApplyButtonDisabled()) {
            return;
        }

        const { enabledTreatNullValuesAsZero, operator: stateOperator, value: stateValue } = this.state;
        const { usePercentage } = this.props;

        const operator = stateOperator === "ALL" ? null : stateOperator;
        const value = usePercentage ? this.convertToRawValue(stateValue, stateOperator) : stateValue;

        this.props.onApply(operator, value, enabledTreatNullValuesAsZero);
    };
}

export const DropdownBodyWithIntl = injectIntl(DropdownBodyWrapped);

export class DropdownBody extends React.PureComponent<IDropdownBodyOwnProps> {
    public render() {
        return (
            <IntlWrapper locale={this.props.locale}>
                <DropdownBodyWithIntl {...this.props} />
            </IntlWrapper>
        );
    }
}
