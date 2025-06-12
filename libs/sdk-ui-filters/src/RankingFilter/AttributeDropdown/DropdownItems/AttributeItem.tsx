// (C) 2020 GoodData Corporation
import React from "react";
import { stringUtils } from "@gooddata/util";
import { ObjRefInScope } from "@gooddata/sdk-model";
import cx from "classnames";
import { Button, Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { IAttributeDropdownItem, ICustomGranularitySelection } from "../../types.js";

interface IAttributeItemProps {
    item: IAttributeDropdownItem;
    iconClass: string;
    isSelected: boolean;
    onSelect: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOver?: (ref: ObjRefInScope) => void;
    onDropDownItemMouseOut?: () => void;
    customGranularitySelection?: ICustomGranularitySelection;
}

export const AttributeItem: React.FC<IAttributeItemProps> = ({
    item,
    iconClass,
    isSelected,
    onSelect,
    onDropDownItemMouseOver,
    onDropDownItemMouseOut,
    customGranularitySelection,
}) => {
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
            <Button className={className} value={title} title={title} disabled={true} />
            <Bubble
                className="bubble-primary gd-rf-tooltip-bubble s-rf-disabled-attribute-bubble"
                alignPoints={[{ align: "cr cl" }, { align: "cl cr" }]}
            >
                {customGranularitySelection.warningMessage}
            </Bubble>
        </BubbleHoverTrigger>
    );
};
