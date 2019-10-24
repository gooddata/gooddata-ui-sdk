// (C) 2019 GoodData Corporation
import * as React from "react";
import { injectIntl, InjectedIntlProps } from "react-intl";
import Button from "@gooddata/goodstrap/lib/Button/Button";

import { IntlWrapper } from "../../base/translations/IntlWrapper";
import OperatorDropdown from "./OperatorDropdown";
import RangeInput from "./RangeInput";
import ComparisonInput from "./ComparisonInput";
import { IValue, MeasureValueFilterOperator } from "./types";
import { isComparisonConditionOperator, isRangeConditionOperator } from "@gooddata/sdk-model";

export interface IInputProps {
    value?: IValue;
    onChange: (value: IValue) => void;
    onEnterKeyPress?: () => void;
}

export interface IDropdownBodyOwnProps {
    operator?: MeasureValueFilterOperator;
    value?: IValue;
    locale?: string;
    onCancel?: () => void;
    onApply: (operator: MeasureValueFilterOperator, value: IValue) => void;
}

export type IDropdownBodyProps = IDropdownBodyOwnProps & InjectedIntlProps;

interface IDropdownBodyState {
    operator: MeasureValueFilterOperator;
    value: IValue;
}

class DropdownBodyWrapped extends React.PureComponent<IDropdownBodyProps, IDropdownBodyState> {
    constructor(props: IDropdownBodyProps) {
        super(props);

        const { operator, value } = props;

        this.state = {
            operator,
            value,
        };
    }

    public render() {
        const { onCancel, intl } = this.props;
        const { operator } = this.state;

        return (
            <div className="gd-mvf-dropdown-body gd-dialog gd-dropdown overlay s-mvf-dropdown-body">
                <div className="gd-mvf-dropdown-content">
                    <div className="gd-mvf-dropdown-section">
                        <OperatorDropdown onSelect={this.handleOperatorSelection} operator={operator} />
                    </div>
                    <div className="gd-mvf-dropdown-section">{this.renderInputSection()}</div>
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
        const { operator, value } = this.state;

        if (isComparisonConditionOperator(operator)) {
            return (
                <ComparisonInput
                    value={value}
                    onChange={this.handleValueChange}
                    onEnterKeyPress={this.onApply}
                />
            );
        } else if (isRangeConditionOperator(operator)) {
            return (
                <RangeInput value={value} onChange={this.handleValueChange} onEnterKeyPress={this.onApply} />
            );
        }

        return null;
    };

    private isApplyButtonDisabled = () => {
        return false;
    };

    private handleOperatorSelection = (operator: MeasureValueFilterOperator) => this.setState({ operator });

    private handleValueChange = (value: IValue) => this.setState({ value });

    private onApply = () => {
        const operator = this.state.operator === "ALL" ? null : this.state.operator;
        this.props.onApply(operator, this.state.value);
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
