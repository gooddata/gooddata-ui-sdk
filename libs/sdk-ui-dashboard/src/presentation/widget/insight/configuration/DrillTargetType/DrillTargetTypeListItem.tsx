// (C) 2023 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import cx from "classnames";
import {
    SingleSelectListItem,
    ISingleSelectListItemProps,
    BubbleHoverTrigger,
    Bubble,
} from "@gooddata/sdk-ui-kit";
import { IDrillTargetType } from "../useDrillTargetTypeItems.js";

interface IDrillTargetTypeListItemProps extends ISingleSelectListItemProps {
    item: IDrillTargetType;
    icon?: string;
    isSelected?: boolean;
    onClick: () => void;
}

const DrillTargetTypeListItem: React.FC<IDrillTargetTypeListItemProps> = ({
    item,
    icon,
    isSelected,
    onClick,
}) => {
    const handleClick = item.disabled ? noop : onClick;
    const className = cx(icon, {
        "is-disabled s-is-disable": item.disabled,
    });

    return (
        <BubbleHoverTrigger hideDelay={0} showDelay={0}>
            <SingleSelectListItem
                className={className}
                title={item.title}
                isSelected={isSelected}
                onClick={handleClick}
            />
            {item.disabled && item.disableTooltipMessage ? (
                <Bubble
                    className="bubble-primary"
                    alignPoints={[{ align: "cr cl" }]}
                    arrowOffsets={{ "cr cl": [15, 0] }}
                >
                    {item.disableTooltipMessage}
                </Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
};

export default DrillTargetTypeListItem;
