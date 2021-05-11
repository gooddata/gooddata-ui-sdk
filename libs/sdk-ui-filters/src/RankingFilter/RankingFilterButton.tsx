// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";

interface IRankingFilterButtonProps {
    isActive: boolean;
    onClick: () => void;
    title: string;
    className?: string;
}

export const RankingFilterButton: React.FC<IRankingFilterButtonProps> = ({
    isActive,
    onClick,
    title,
    className,
}) => {
    const buttonClassName = cx(
        "gd-button",
        "gd-button-secondary",
        "gd-button-small",
        "button-dropdown",
        "gd-icon-right",
        { "gd-icon-navigateup": isActive, "gd-icon-navigatedown": !isActive },
        "s-rf-dropdown-button",
        className,
    );

    return (
        <button className={buttonClassName} onClick={onClick}>
            {title}
        </button>
    );
};
