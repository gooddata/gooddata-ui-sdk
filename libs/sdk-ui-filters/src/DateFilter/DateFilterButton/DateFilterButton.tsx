// (C) 2007-2025 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { isActionKey } from "@gooddata/sdk-ui-kit";
import { FilterButtonCustomIcon, IFilterButtonCustomIcon } from "../../shared/index.js";

export interface IDateFilterButtonProps {
    title: React.ReactNode;
    isOpen?: boolean;
    isMobile: boolean;
    disabled?: boolean;
    customIcon?: IFilterButtonCustomIcon;
    children?: React.ReactNode;
    customFilterName?: string;
    onClick?: () => void;
}

export const DateFilterButton: React.FC<IDateFilterButtonProps> = ({
    isOpen,
    isMobile,
    title,
    children,
    disabled,
    customIcon,
    customFilterName,
    onClick,
}) => {
    const onKeyDown = useCallback(
        (event) => {
            // This enables keyboard interaction events after focus
            if (isActionKey(event)) {
                event.preventDefault();
                onClick();
            }
        },
        [onClick],
    );

    return (
        <div
            className={cx(
                "s-date-filter-button",
                "gd-date-filter-button",
                `s-date-filter-button-${stringUtils.simplifyText(customFilterName)}`,
                "dropdown-button",
                isMobile && "gd-date-filter-button-mobile",
                isOpen && "is-active",
                disabled && "disabled",
            )}
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
        >
            <div className="button-content">
                <div className="s-date-filter-title button-title">{title}</div>
                <div className="button-subtitle">{children}</div>
            </div>
            <FilterButtonCustomIcon customIcon={customIcon} disabled={disabled} />
        </div>
    );
};
