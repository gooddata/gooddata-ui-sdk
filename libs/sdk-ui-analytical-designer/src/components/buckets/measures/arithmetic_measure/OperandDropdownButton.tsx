// (C) 2007-2026 GoodData Corporation

import { type ReactElement, memo } from "react";

import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import { type IOperandDropdownItem } from "./model/operand_dropdown_item.js";

export interface IOperandDropdownButtonProps {
    selectedMeasure: IOperandDropdownItem | null;
    operandIndex: number;
    opened: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

export const OperandDropdownButton = memo(function OperandDropdownButton({
    selectedMeasure,
    operandIndex,
    opened,
    disabled = false,
    onClick = () => {},
}: IOperandDropdownButtonProps): ReactElement {
    const renderEmptyDropdownButtonContent = (): ReactElement => {
        return (
            <span className={"adi-am-selector-title-add gd-icon-plus"}>
                <FormattedMessage id="dashboard.bucket_item.arithmetic_measure.empty_operand_dropdown_label" />
            </span>
        );
    };

    const renderSetDropdownButtonContent = (): ReactElement => {
        const title = selectedMeasure.title;

        return (
            <span>
                <span
                    className={
                        "adi-am-selector-name adi-am-selector-title-name s-adi-am-selector-title-name gd-icon-navigateright"
                    }
                >
                    <FormattedMessage
                        id="bucket.title.measureSequenceNumber"
                        values={{ measureSequenceNumber: selectedMeasure.sequenceNumber }}
                    />
                </span>
                <span
                    className={
                        "adi-am-selector-subtitle adi-am-selector-title-subtitle s-adi-am-selector-title-subtitle"
                    }
                >
                    {` (${title})`}
                </span>
            </span>
        );
    };

    const className = classNames(
        `s-arithmetic-measure-operand-${operandIndex}-dropdown-button s-am-operand-button`,
        {
            "s-expanded": opened,
            "adi-am-selector-expanded": opened,
            "s-collapsed": !opened,
            disabled: disabled,
        },
    );

    const operandChar = String.fromCharCode("A".charCodeAt(0) + operandIndex);

    const additionalProps = disabled ? {} : { onClick };
    return (
        <div className={className} {...additionalProps}>
            <div className={"adi-am-selector-title"}>
                <span className={"adi-am-selector-title-order"}>{operandChar}</span>
                {selectedMeasure === null
                    ? renderEmptyDropdownButtonContent()
                    : renderSetDropdownButtonContent()}
            </div>
        </div>
    );
});
