// (C) 2024-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import {
    type IInsightMenuItem,
    type IInsightMenuSubmenuComponentProps,
    isIInsightMenuSubmenu,
} from "../../insightMenu/types.js";
import { useEditableInsightMenu } from "../../widget/InsightWidget/useEditableInsightMenu.js";

export const useVisualizationSwitcherEditableInsightMenu = (
    widget: IInsightWidget,
    insight: IInsight,
    onVisualizationDeleted: (visualizationWidgetId: string) => void,
): { menuItems: IInsightMenuItem[] } => {
    const intl = useIntl();
    const { menuItems } = useEditableInsightMenu({
        widget,
        insight,
        closeMenu: () => {},
    });

    const modifiedMenuItems = menuItems.map((item) => {
        if (item.itemId === "ConfigurationPanelSubmenu" && isIInsightMenuSubmenu(item)) {
            return {
                ...item,
                SubmenuComponent: item.SubmenuComponent
                    ? (props: IInsightMenuSubmenuComponentProps) => {
                          const Component = item.SubmenuComponent!;
                          return <Component {...props} enableTitleConfig={false} />;
                      }
                    : undefined,
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
