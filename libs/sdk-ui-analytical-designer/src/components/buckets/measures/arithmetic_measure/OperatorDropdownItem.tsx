// (C) 2007-2026 GoodData Corporation

import { type ReactElement } from "react";

import classNames from "classnames";
import { FormattedMessage, defineMessage } from "react-intl";

import { type IOperatorDropdownItem } from "../../../../typings/arithmetic_measure.js";

import { OperatorDropdownItemBubble } from "./OperatorDropdownItemBubble.js";

const operatorMessageIds = {
    sum: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_sum" }).id,
    ratio: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_ratio" }).id,
    difference: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_difference" }).id,
    multiplication: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_multiplication" })
        .id,
    change: defineMessage({ id: "dashboard.bucket_item.arithmetic_measure.operator_change" }).id,
} as const;

export interface IOperatorDropdownItemProps {
    onSelect: (source: IOperatorDropdownItem) => void;
    selected: boolean;
    source: IOperatorDropdownItem;
}

export function OperatorDropdownItem({
    onSelect,
    selected,
    source,
}: IOperatorDropdownItemProps): ReactElement {
    const getClassNames = (): string => {
        return classNames("gd-list-item s-gd-list-item", {
            "is-selected": selected,
            "s-is-selected": selected,
        });
    };

    const getContentClassNames = (): string => {
        return classNames(
            `s-adi-am-operator-selector-item-${source.type}`,
            "adi-am-operator-selector-item",
            `adi-am-operator-selector-item-${source.type}`,
        );
    };

    const handleSelect = () => {
        onSelect(source);
    };

    return (
        <div className={getClassNames()} onClick={handleSelect}>
            <span className={getContentClassNames()}>
                <FormattedMessage
                    id={
                        operatorMessageIds[source.type as keyof typeof operatorMessageIds] ??
                        `dashboard.bucket_item.arithmetic_measure.operator_${source.type}`
                    }
                    values={{ i: (chunks) => <i>{chunks}</i> }}
                />
            </span>
            {source.tooltip ? <OperatorDropdownItemBubble type={source.type} /> : null}
        </div>
    );
}
