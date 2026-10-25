// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, type ReactElement, memo } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

import { type ArithmeticOperatorType } from "../../../../typings/arithmetic_measure.js";

const operatorMessageIds = {
    sum: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_sum" }).id,
    ratio: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_ratio" }).id,
    difference: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_difference" }).id,
    multiplication: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_multiplication" })
        .id,
    change: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_change" }).id,
} as const;

export interface IOperatorDropdownButtonProps {
    selectedOperator: ArithmeticOperatorType;
    opened: boolean;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}

export const OperatorDropdownButton = memo(function OperatorDropdownButton({
    selectedOperator,
    opened,
    onClick,
}: IOperatorDropdownButtonProps): ReactElement {
    const getClassNames = (): string => {
        return classNames("adi-am-operator-selector-button", "s-adi-am-operator-selector-title", {
            "s-expanded": opened,
            "adi-am-operator-selector-button-expanded": opened,
            "s-collapsed": !opened,
        });
    };

    const getContentClassNames = (): string => {
        return classNames(
            "adi-am-operator-selector-item",
            `adi-am-operator-selector-item-${selectedOperator}`,
        );
    };

    return (
        <div className={getClassNames()} onClick={onClick}>
            <span>
                <span className={getContentClassNames()}>
                    <FormattedMessage
                        id={
                            operatorMessageIds[selectedOperator as keyof typeof operatorMessageIds] ??
                            `dashboard.bucket_item.arithmetic_measure.operator_${selectedOperator}`
                        }
                        values={{ i: (chunks) => <i>{chunks}</i> }}
                    />
                </span>
            </span>
        </div>
    );
});
