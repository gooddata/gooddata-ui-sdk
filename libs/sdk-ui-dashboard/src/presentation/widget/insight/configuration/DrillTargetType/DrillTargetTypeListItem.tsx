// (C) 2023-2025 GoodData Corporation
import React, { ReactNode } from "react";

import cx from "classnames";
import noop from "lodash/noop.js";
import { useIntl } from "react-intl";

import {
    Bubble,
    BubbleHoverTrigger,
    ISingleSelectListItemProps,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";

import { IDrillTargetType } from "../useDrillTargetTypeItems.js";

const DEFAULT_ALIGN_POINTS = [{ align: "cr cl" }];
const DEFAULT_ALIGN_OFFSETS = { "cr cl": [15, 0] };

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
    const { formatMessage } = useIntl();
    const handleClick = item.disabled ? noop : onClick;
    const className = cx(icon, {
        "is-disabled s-is-disable": item.disabled,
    });

    return (
        <BubbleHoverTrigger hideDelay={0} showDelay={0}>
            <SingleSelectListItem
                className={className}
                title={item.title}
                info={formatMessage(
                    { id: item.tooltipMessage },
                    {
                        a: (chunk: ReactNode) => {
                            return item.documentUrl ? (
                                <a href={item.documentUrl} target="_blank" rel="noreferrer">
                                    {chunk}
                                </a>
                            ) : null;
                        },
                    },
                )}
                eventsOnBubble={true}
                hideDelayBubble={100}
                isSelected={isSelected}
                onClick={handleClick}
            />
            {item.disabled && item.disableTooltipMessage ? (
                <Bubble
                    className="bubble-primary"
                    alignPoints={DEFAULT_ALIGN_POINTS}
                    arrowOffsets={DEFAULT_ALIGN_OFFSETS}
                >
                    {item.disableTooltipMessage}
                </Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
};

export default DrillTargetTypeListItem;
