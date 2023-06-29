// (C) 2021-2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { ConfigurationBubble } from "../../../common/index.js";

interface IDashboardInsightMenuBubbleProps {
    onClose: () => void;
    isSubmenu?: boolean;
    children?: React.ReactNode;
}

export const DashboardInsightEditMenuBubble: React.FC<IDashboardInsightMenuBubbleProps> = (props) => {
    const { children, onClose, isSubmenu } = props;

    return (
        <ConfigurationBubble
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
};
