// (C) 2007-2025 GoodData Corporation
import React, { useCallback } from "react";

import cx from "classnames";

import { isActionKey } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { FilterButtonCustomIcon, IFilterButtonCustomIcon } from "../../shared/index.js";

/**
 * @alpha
 */
export interface IDateFilterButtonProps {
    title: React.ReactNode;
    isOpen?: boolean;
    isMobile: boolean;
    disabled?: boolean;
    customIcon?: IFilterButtonCustomIcon;
    children?: React.ReactNode;
    customFilterName?: string;
    buttonRef?: React.MutableRefObject<HTMLElement | null>;
    dropdownId?: string;
    onClick?: () => void;
    textTitle?: string;
    textSubtitle?: string;
}

export function DateFilterButton({
    isOpen,
    isMobile,
    title,
    children,
    disabled,
    customIcon,
    customFilterName,
    buttonRef,
    dropdownId,
}: IDateFilterButtonProps) {
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (isActionKey(e) && disabled) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [disabled],
    );

    return (
        <div
            ref={buttonRef as React.MutableRefObject<HTMLDivElement>}
            className={cx(
                "s-date-filter-button",
                "gd-date-filter-button",
                `s-date-filter-button-${stringUtils.simplifyText(customFilterName)}`,
                "dropdown-button",
                isMobile && "gd-date-filter-button-mobile",
                isOpen && "is-active",
                disabled && "disabled",
            )}
            role="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? dropdownId : undefined}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="button-content">
                <div className="s-date-filter-title button-title">{title}</div>
                <div className="button-subtitle">{children}</div>
            </div>
            <FilterButtonCustomIcon customIcon={customIcon} disabled={disabled} />
        </div>
    );
}
