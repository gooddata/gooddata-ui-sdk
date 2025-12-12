// (C) 2022-2025 GoodData Corporation

import { type MouseEvent } from "react";

import cx from "classnames";

import { stringUtils } from "@gooddata/util";

interface IConnectingAttributeItemProps {
    title: string;
    icon: string;
    selected: boolean;
    onClick: () => void;
}

export function ConnectingAttributeItem({ title, icon, selected, onClick }: IConnectingAttributeItemProps) {
    const handleOnClick = (e: MouseEvent<HTMLDivElement>) => {
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
}
