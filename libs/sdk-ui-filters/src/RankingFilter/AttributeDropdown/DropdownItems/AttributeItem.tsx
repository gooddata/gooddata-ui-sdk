// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

import { type ObjRefInScope } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { type IAttributeDropdownItem, type ICustomGranularitySelection } from "../../types.js";

interface IAttributeItemProps {
    item: IAttributeDropdownItem;
    iconClass: string;
    isSelected: boolean;
    onSelect: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
}

export function AttributeItem({
    item,
    iconClass,
    isSelected,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
}: IAttributeItemProps) {
    const { title, ref } = item;
    const isDisabled = customGranularitySelection && !customGranularitySelection.enable;
    const className = cx(
        "gd-list-item",
        "gd-list-item-shortened",
        {
            "is-selected": isSelected,
            "is-disabled": isDisabled,
        },
        "gd-button-link",
        iconClass,
        `s-rf-attribute-${stringUtils.simplifyText(title)}`,
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

    if (!isDisabled) {
        return (
            <button
                className={className}
                onClick={() => onSelect(ref)}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                title={title}
            >
                <span>{title}</span>
            </button>
        );
    }

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0}>
            <Button className={className} value={title} title={title} disabled />
            <Bubble
                className="bubble-primary gd-rf-tooltip-bubble s-rf-disabled-attribute-bubble"
                alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
            >
                {customGranularitySelection.warningMessage}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
