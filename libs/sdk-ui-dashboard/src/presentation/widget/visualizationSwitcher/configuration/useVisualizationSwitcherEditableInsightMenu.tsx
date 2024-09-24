// (C) 2024 GoodData Corporation

import React from "react";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import noop from "lodash/noop.js";
import { useEditableInsightMenu } from "../../widget/InsightWidget/useEditableInsightMenu.js";
import {
    IInsightMenuItem,
    IInsightMenuSubmenuComponentProps,
    isIInsightMenuSubmenu,
} from "../../insightMenu/types.js";

export const useVisualizationSwitcherEditableInsightMenu = (
    widget: IInsightWidget,
    insight: IInsight,
): { menuItems: IInsightMenuItem[] } => {
    const { menuItems } = useEditableInsightMenu({
        widget,
        insight,
        closeMenu: noop,
    });

    const modifiedMenuItems = menuItems.map((item) => {
        if (item.itemId === "ConfigurationPanelSubmenu" && isIInsightMenuSubmenu(item)) {
            return {
                ...item,
                SubmenuComponent: (props: IInsightMenuSubmenuComponentProps) => (
                    <item.SubmenuComponent {...props} enableTitleConfig={false} />
                ),
            };
        }

        return item;
    });
    return { menuItems: modifiedMenuItems };
};
