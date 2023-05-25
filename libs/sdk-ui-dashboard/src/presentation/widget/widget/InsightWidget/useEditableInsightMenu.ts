// (C) 2021-2023 GoodData Corporation
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import { getDefaultInsightEditMenuItems, IInsightMenuItem } from "../../insightMenu/index.js";
import {
    selectDrillTargetsByWidgetRef,
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";

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
    const dispatch = useDashboardDispatch();

    const settings = useDashboardSelector(selectSettings);
    const {
        enableKPIDashboardDrillToURL,
        enableKPIDashboardDrillToDashboard,
        enableKPIDashboardDrillToInsight,
    } = settings;

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widget.ref));
    const someDrillingEnabled =
        enableKPIDashboardDrillToURL ||
        enableKPIDashboardDrillToDashboard ||
        enableKPIDashboardDrillToInsight;
    const availableDrillTargets = configItems?.availableDrillTargets;
    const someAvailableDrillTargetsExist =
        !!availableDrillTargets?.attributes?.length || !!availableDrillTargets?.measures?.length;

    const includeInteractions = someDrillingEnabled && someAvailableDrillTargetsExist;

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useMemo<IInsightMenuItem[]>(() => {
        return getDefaultInsightEditMenuItems(widget, { intl, dispatch, includeInteractions });
    }, [dispatch, intl, widget, includeInteractions]);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "edit")
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu]);

    return { menuItems };
};
