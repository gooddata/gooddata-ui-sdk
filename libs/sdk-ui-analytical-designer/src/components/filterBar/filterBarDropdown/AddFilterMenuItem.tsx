// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import classNames from "classnames";

import { UiIcon } from "@gooddata/sdk-ui-kit";

export interface IAddFilterMenuItemProps {
    /** the s- test class naming the item */
    testClassName: string;
    icon: ReactNode;
    /** the object-type class of the icon, which gives it its color */
    iconClassName?: string;
    label: string;
    /** whether the item opens a further picker, shown by the submenu chevron */
    hasSubmenu?: boolean;
    disabled?: boolean;
    onClick: () => void;
}

/**
 * One entry of an "Add filter for" menu: the filter bar's and the metric's share the look, the
 * menus differ only in which entries they offer. A disabled entry stays focusable (aria-disabled,
 * not the native attribute), so the tooltip explaining it is reachable by keyboard as well.
 */
export function AddFilterMenuItem({
    testClassName,
    icon,
    iconClassName,
    label,
    hasSubmenu = false,
    disabled = false,
    onClick,
}: IAddFilterMenuItemProps) {
    return (
        <button
            type="button"
            className={classNames("adi-add-filter-menu-item", testClassName, { "is-disabled": disabled })}
            onClick={disabled ? undefined : onClick}
            aria-disabled={disabled || undefined}
        >
            <span className={classNames("adi-add-filter-menu-item__icon", iconClassName)}>{icon}</span>
            <span className="adi-add-filter-menu-item__label">{label}</span>
            {hasSubmenu ? (
                <span className="adi-add-filter-menu-item__submenu-icon">
                    <UiIcon type="navigateRight" size={14} color="complementary-5" />
                </span>
            ) : null}
        </button>
    );
}
