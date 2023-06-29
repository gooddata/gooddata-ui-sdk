// (C) 2019 GoodData Corporation
import React from "react";
import { Separator, Overlay } from "@gooddata/sdk-ui-kit";

import OperatorDropdownItem from "./OperatorDropdownItem.js";
import { MeasureValueFilterOperator } from "./types.js";

import { WrappedComponentProps, injectIntl } from "react-intl";

interface IOperatorDropdownBodyOwnProps {
    selectedOperator: MeasureValueFilterOperator;
    onSelect: (operator: MeasureValueFilterOperator) => void;
    onClose: () => void;
    alignTo: string;
}

type IOperatorDropdownBodyProps = IOperatorDropdownBodyOwnProps & WrappedComponentProps;

class OperatorDropdownBody extends React.PureComponent<IOperatorDropdownBodyProps> {
    public render() {
        const { onSelect, onClose, selectedOperator, alignTo, intl } = this.props;

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
    }
}

export default injectIntl(OperatorDropdownBody);
