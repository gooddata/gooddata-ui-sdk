// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { type IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";

interface ITabsWrapperProps {
    className?: string;
    children: ReactNode;
}

export function TabsWrapper({ className, children, ...restProps }: ITabsWrapperProps) {
    const intl = useIntl();

    return (
        <div
            role="tablist"
            aria-label={intl.formatMessage({ id: "dateFilterDropdown.relativeForm.label" })}
            className={cx("gd-tabs small is-condensed", className)}
            {...restProps}
        >
            {children}
        </div>
    );
}

interface ITabProps {
    selected?: boolean;
    className?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    children: ReactNode;
    onClick?: () => void;
    /**
     * DOM id applied to this tab's button when `selected` is true, so a panel elsewhere on the page can
     * point `aria-labelledby` back at it.
     */
    selectedTabId: string;
}

export function Tab({
    selected,
    className,
    accessibilityConfig,
    onClick,
    children,
    selectedTabId,
    ...restProps
}: ITabProps) {
    return (
        <button
            id={selected ? selectedTabId : undefined}
            onClick={onClick}
            role="tab"
            aria-selected={selected}
            aria-controls={selected ? accessibilityConfig?.ariaControls : undefined}
            tabIndex={selected ? 0 : -1}
            className={cx(selected && "is-active", "gd-tab", className)}
            {...restProps}
        >
            {children}
        </button>
    );
}
