// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

import { type RankingFilterOperator } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

interface IOperatorDropdownItemProps {
    title: string;
    value: RankingFilterOperator;
    isSelected: boolean;
    onSelect: (value: RankingFilterOperator) => void;
}

export function OperatorDropdownItem({ title, value, isSelected, onSelect }: IOperatorDropdownItemProps) {
    const className = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        {
            "is-selected": isSelected,
        },
        "gd-button-link",
        `s-rf-operator-${stringUtils.simplifyText(title)}`,
    );

    return (
        <button className={className} onClick={() => onSelect(value)}>
            <span>{title}</span>
        </button>
    );
}
