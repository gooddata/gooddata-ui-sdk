// (C) 2023 GoodData Corporation
import React from "react";
import noop from "lodash/noop.js";
import cx from "classnames";
import { SingleSelectListItem, ISingleSelectListItemProps } from "@gooddata/sdk-ui-kit";

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
        <SingleSelectListItem
            className={className}
            title={item.title}
            isSelected={isSelected}
            onClick={handleClick}
        />
    );
};

export default DrillTargetTypeListItem;
