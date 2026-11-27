// (C) 2007-2026 GoodData Corporation

import { type KeyboardEvent, type MutableRefObject, type ReactNode, useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { isActionKey, useIdPrefixed } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { FilterButtonCustomIcon } from "../../shared/components/internal/FilterButtonCustomIcon.js";
import { type IFilterButtonCustomIcon } from "../../shared/interfaces/index.js";

/**
 * @alpha
 */
export interface IDateFilterButtonProps {
    title: ReactNode;
    isOpen?: boolean;
    isMobile: boolean;
    disabled?: boolean;
    customIcon?: IFilterButtonCustomIcon;
    children?: ReactNode;
    customFilterName?: string;
    buttonRef?: MutableRefObject<HTMLElement | null>;
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
    const intl = useIntl();
    const lockedDescriptionId = useIdPrefixed("date-filter-button-locked");
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (isActionKey(e) && disabled) {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        [disabled],
    );

    return (
        <div
            ref={buttonRef as MutableRefObject<HTMLDivElement>}
            className={cx(
                "s-date-filter-button",
                "gd-date-filter-button",
                `s-date-filter-button-${simplifyText(customFilterName ?? "")}`,
                "dropdown-button",
                isMobile && "gd-date-filter-button-mobile",
                isOpen && "is-active",
                disabled && "disabled",
            )}
            role="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={isOpen ? dropdownId : undefined}
            aria-disabled={disabled || undefined}
            aria-describedby={disabled ? lockedDescriptionId : undefined}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {disabled ? (
                // aria-hidden keeps the text out of the button's name; aria-describedby still reads it.
                <span className="sr-only" id={lockedDescriptionId} aria-hidden="true">
                    {intl.formatMessage({ id: "filters.locked.filter.tooltip" })}
                </span>
            ) : null}
            <div className="button-content">
                <div className="s-date-filter-title button-title">{title}</div>
                <div className="button-subtitle">{children}</div>
            </div>
            <FilterButtonCustomIcon customIcon={customIcon} disabled={disabled} />
        </div>
    );
}
