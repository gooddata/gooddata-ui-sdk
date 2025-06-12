// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DATE_FILTER_RELATIVE_GRANULARITY_TAB_ID } from "../accessibility/elementId.js";
import { IAccessibilityConfigBase } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";

interface ITabsWrapperProps {
    className?: string;
    children: React.ReactNode;
}

export const TabsWrapper: React.FC<ITabsWrapperProps> = ({ className, children, ...restProps }) => {
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
};

interface ITabProps {
    selected?: boolean;
    className?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    children: React.ReactNode;
    onClick?: () => void;
}

export const Tab: React.FC<ITabProps> = ({
    selected,
    className,
    accessibilityConfig,
    onClick,
    children,
    ...restProps
}) => (
    <button
        id={selected ? DATE_FILTER_RELATIVE_GRANULARITY_TAB_ID : undefined}
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
