// (C) 2022 GoodData Corporation
import React from "react";

import cx from "classnames";
import { stringUtils } from "@gooddata/util";

interface IConnectingAttributeItemProps {
    title: string;
    icon: string;
    selected: boolean;
    onClick: () => void;
}

export const ConnectingAttributeItem: React.FC<IConnectingAttributeItemProps> = ({
    title,
    icon,
    selected,
    onClick,
}) => {
    const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onClick();
        e.preventDefault();
    };

    const className = cx("gd-list-item", `s-${stringUtils.simplifyText(title)}`, {
        "is-selected": selected,
    });

    return (
        <div className={className} onClick={handleOnClick}>
            <span className={cx("gd-list-icon", icon)} />
            <span>{title}</span>
        </div>
    );
};
