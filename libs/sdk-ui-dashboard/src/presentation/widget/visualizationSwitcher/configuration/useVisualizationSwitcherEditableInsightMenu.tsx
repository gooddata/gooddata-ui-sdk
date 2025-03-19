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
import { useIntl } from "react-intl";

export const useVisualizationSwitcherEditableInsightMenu = (
    widget: IInsightWidget,
    insight: IInsight,
    onVisualizationDeleted: (visualizationWidgetId: string) => void,
): { menuItems: IInsightMenuItem[] } => {
    const intl = useIntl();
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
        if (item.itemId === "InteractionPanelRemove") {
            return {
                ...item,
                itemName: intl.formatMessage({
                    id: "visualizationSwitcher.configurationPanel.remove.from.switcher",
                }),
                onClick: () => onVisualizationDeleted(widget.identifier),
            };
        }

        return item;
    });
    return { menuItems: modifiedMenuItems };
};
