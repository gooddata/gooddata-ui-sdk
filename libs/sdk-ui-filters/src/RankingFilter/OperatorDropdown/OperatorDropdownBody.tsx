// (C) 2020 GoodData Corporation
import React from "react";
import Overlay from "@gooddata/goodstrap/lib/core/Overlay";
import { RankingFilterOperator } from "@gooddata/sdk-model";
import { OperatorDropdownItem } from "./OperatorDropdownItem";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { IOperatorDropdownItem } from "../types";

interface IOperatorDropdownBodyComponentOwnProps {
    items: IOperatorDropdownItem[];
    selectedValue: RankingFilterOperator;
    onSelect: (value: RankingFilterOperator) => void;
    onClose: () => void;
}

type OperatorDropdownBodyComponentProps = IOperatorDropdownBodyComponentOwnProps & WrappedComponentProps;

const OperatorDropdownBodyComponent: React.FC<OperatorDropdownBodyComponentProps> = ({
    items,
    selectedValue,
    onSelect,
    onClose,
    intl,
}) => {
    return (
        <Overlay
            closeOnOutsideClick={true}
            alignTo=".gd-rf-operator-dropdown-button"
            alignPoints={[{ align: "bl tl" }, { align: "tl bl" }]}
            onClose={onClose}
        >
            <div className="gd-dropdown overlay gd-rf-inner-overlay-dropdown gd-rf-operator-dropdown-body s-rf-operator-dropdown-body">
                {items.map(({ value, translationId }) => {
                    const title = intl.formatMessage({ id: translationId });

                    return (
                        <OperatorDropdownItem
                            key={value}
                            title={title}
                            value={value}
                            isSelected={value === selectedValue}
                            onSelect={onSelect}
                        />
                    );
                })}
            </div>
        </Overlay>
    );
};

export const OperatorDropdownBody = injectIntl(OperatorDropdownBodyComponent);
