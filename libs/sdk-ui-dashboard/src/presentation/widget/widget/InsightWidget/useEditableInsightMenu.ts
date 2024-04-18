// (C) 2021-2024 GoodData Corporation
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import { getDefaultInsightEditMenuItems, IInsightMenuItem } from "../../insightMenu/index.js";
import {
    selectDrillTargetsByWidgetRef,
    selectSettings,
    useDashboardDispatch,
    useDashboardEventDispatch,
    useDashboardSelector,
    selectPredictionResult,
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
    const eventDispatch = useDashboardEventDispatch();

    const settings = useDashboardSelector(selectSettings);
    const {
        enableKPIDashboardDrillToURL,
        enableKPIDashboardDrillToDashboard,
        enableKPIDashboardDrillToInsight,
    } = settings;

    const prediction = useDashboardSelector(selectPredictionResult(widget.ref));

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
        return getDefaultInsightEditMenuItems(widget, {
            intl,
            dispatch,
            eventDispatch,
            includeInteractions,
        });
    }, [dispatch, eventDispatch, intl, widget, includeInteractions]);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "edit", prediction)
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu, prediction]);

    return { menuItems };
};
