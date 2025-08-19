// (C) 2019-2025 GoodData Corporation
import React, { memo } from "react";

import { useIntl } from "react-intl";

import { Overlay, Separator } from "@gooddata/sdk-ui-kit";

import OperatorDropdownItem from "./OperatorDropdownItem.js";
import { MeasureValueFilterOperator } from "./types.js";

interface IOperatorDropdownBodyProps {
    selectedOperator: MeasureValueFilterOperator;
    onSelect: (operator: MeasureValueFilterOperator) => void;
    onClose: () => void;
    alignTo: string;
}

const OperatorDropdownBody = memo(function OperatorDropdownBody({
    onSelect,
    onClose,
    selectedOperator,
    alignTo,
}: IOperatorDropdownBodyProps) {
    const intl = useIntl();

    return (
        <Overlay
            closeOnOutsideClick={true}
            alignTo={alignTo}
            alignPoints={[{ align: "bl tl" }]}
            onClose={onClose}
        >
            <div className="gd-dropdown overlay">
                <div className="gd-mvf-operator-dropdown-body s-mvf-operator-dropdown-body">
                    <OperatorDropdownItem
                        operator="ALL"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                    />
                    <Separator />
                    <OperatorDropdownItem
                        operator="GREATER_THAN"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                    />
                    <OperatorDropdownItem
                        operator="GREATER_THAN_OR_EQUAL_TO"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                    />
                    <Separator />
                    <OperatorDropdownItem
                        operator="LESS_THAN"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                    />
                    <OperatorDropdownItem
                        operator="LESS_THAN_OR_EQUAL_TO"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                    />
                    <Separator />
                    <OperatorDropdownItem
                        operator="BETWEEN"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                        bubbleText={intl.formatMessage({ id: "mvf.operator.between.tooltip.bubble" })}
                    />
                    <OperatorDropdownItem
                        operator="NOT_BETWEEN"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                        bubbleText={intl.formatMessage({ id: "mvf.operator.notBetween.tooltip.bubble" })}
                    />
                    <Separator />
                    <OperatorDropdownItem
                        operator="EQUAL_TO"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                    />
                    <OperatorDropdownItem
                        operator="NOT_EQUAL_TO"
                        selectedOperator={selectedOperator}
                        onClick={onSelect}
                    />
                </div>
            </div>
        </Overlay>
    );
});

export default OperatorDropdownBody;
