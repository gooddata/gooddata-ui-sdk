// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

import { type ObjRefInScope } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";

import { type IMeasureDropdownItem } from "../types.js";

interface IMeasureDropdownItemProps {
    item: IMeasureDropdownItem;
    isSelected: boolean;
    onSelect: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
}

export function MeasureDropdownItem({
    item,
    isSelected,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
}: IMeasureDropdownItemProps) {
    const { title, ref, sequenceNumber } = item;

    const className = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        {
            "is-selected": isSelected,
        },
        "gd-button-link",
        "gd-icon-metric",
        `s-rf-measure-${stringUtils.simplifyText(title)}`,
    );

    const onMouseOver = () => {
        if (onDropDownItemMouseOver) {
            onDropDownItemMouseOver(ref);
        }
    };

    const onMouseOut = () => {
        if (onDropDownItemMouseOut) {
            onDropDownItemMouseOut();
        }
    };

    return (
        <button
            className={className}
            onClick={() => onSelect(ref)}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            title={title}
        >
            <span className="gd-rf-measure-title">{title}</span>
            {sequenceNumber ? <span className="gd-rf-sequence-number">{sequenceNumber}</span> : null}
        </button>
    );
}
