// (C) 2020-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { RankingFilterOperator } from "@gooddata/sdk-model";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { OperatorDropdownItem } from "./OperatorDropdownItem.js";
import { IOperatorDropdownItem } from "../types.js";

interface OperatorDropdownBodyComponentProps {
    items: IOperatorDropdownItem[];
    selectedValue: RankingFilterOperator;
    onSelect: (value: RankingFilterOperator) => void;
    onClose: () => void;
}

export function OperatorDropdownBody({
    items,
    selectedValue,
    onSelect,
    onClose,
}: OperatorDropdownBodyComponentProps) {
    const intl = useIntl();

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
}
