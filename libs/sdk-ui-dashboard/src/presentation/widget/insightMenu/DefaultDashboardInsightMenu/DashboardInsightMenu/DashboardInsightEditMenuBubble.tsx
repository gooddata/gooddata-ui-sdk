// (C) 2021-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";

import { ConfigurationBubble } from "../../../common/index.js";

interface IDashboardInsightMenuBubbleProps {
    onClose: () => void;
    isSubmenu?: boolean;
    children?: ReactNode;
}

export function DashboardInsightEditMenuBubble({
    children,
    onClose,
    isSubmenu,
}: IDashboardInsightMenuBubbleProps) {
    return (
        <ConfigurationBubble
            alignTo=".s-dash-item.is-selected"
            classNames={cx(
                "edit-insight-config",
                "s-edit-insight-config",
                "edit-insight-config-title-1-line",
                isSubmenu ? "edit-insight-config-arrow-submenu-color" : "edit-insight-config-arrow-color",
            )}
            onClose={onClose}
        >
            {children}
        </ConfigurationBubble>
    );
}
