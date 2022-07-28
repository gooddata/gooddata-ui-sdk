// (C) 2021-2022 GoodData Corporation
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { useDashboardCustomizationsContext } from "../../../dashboardContexts";
import { getDefaultInsightEditMenuItems, IInsightMenuItem } from "../../insightMenu";

type UseEditableInsightMenuConfig = {
    insight: IInsight;
    widget: IInsightWidget;
    closeMenu: () => void;
};

export const useEditableInsightMenu = (
    config: UseEditableInsightMenuConfig,
): { menuItems: IInsightMenuItem[] } => {
    const { insight, widget, closeMenu } = config;

    const intl = useIntl();

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useMemo<IInsightMenuItem[]>(() => {
        return getDefaultInsightEditMenuItems(intl, {
            widget,
        });
    }, [widget, intl]);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "edit")
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu]);

    return { menuItems };
};
