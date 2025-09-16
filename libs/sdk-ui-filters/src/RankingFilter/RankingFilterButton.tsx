// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

interface IRankingFilterButtonProps {
    isActive: boolean;
    onClick: () => void;
    title: string;
    className?: string;
}

export function RankingFilterButton({ isActive, onClick, title, className }: IRankingFilterButtonProps) {
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
}
