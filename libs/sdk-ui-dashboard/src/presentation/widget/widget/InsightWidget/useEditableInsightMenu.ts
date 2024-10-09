// (C) 2021-2024 GoodData Corporation
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import { getDefaultInsightEditMenuItems, IInsightMenuItem } from "../../insightMenu/index.js";
import {
    selectDashboardUserAutomationAlertsInContext,
    selectDashboardUserAutomationSchedulesInContext,
    selectDrillTargetsByWidgetRef,
    selectEnableAlerting,
    selectEnableScheduling,
    selectSettings,
    useDashboardDispatch,
    useDashboardEventDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";

type UseEditableInsightMenuConfig = {
    insight?: IInsight;
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

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widget.ref));
    const someDrillingEnabled =
        enableKPIDashboardDrillToURL ||
        enableKPIDashboardDrillToDashboard ||
        enableKPIDashboardDrillToInsight;
    const availableDrillTargets = configItems?.availableDrillTargets;
    const someAvailableDrillTargetsExist =
        !!availableDrillTargets?.attributes?.length || !!availableDrillTargets?.measures?.length;

    const includeInteractions = someDrillingEnabled && someAvailableDrillTargetsExist && Boolean(insight);
    const includeConfigurations = Boolean(insight);

    const isSchedulingEnabled = useDashboardSelector(selectEnableScheduling);
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);
    const alerts = useDashboardSelector(selectDashboardUserAutomationAlertsInContext(widget.localIdentifier));
    const schedules = useDashboardSelector(
        selectDashboardUserAutomationSchedulesInContext(widget.localIdentifier),
    );

    const useWidgetDeleteDialog = useMemo(
        () =>
            // new widgets in edit mode do not have localIdentifier, so should be deleted without confirmation dialog
            !!widget.localIdentifier &&
            ((isAlertingEnabled && alerts.length > 0) || (isSchedulingEnabled && schedules.length > 0)),
        [alerts.length, isAlertingEnabled, isSchedulingEnabled, schedules.length, widget.localIdentifier],
    );

    const { insightMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useMemo<IInsightMenuItem[]>(() => {
        return getDefaultInsightEditMenuItems(widget, {
            intl,
            dispatch,
            eventDispatch,
            includeInteractions,
            includeConfigurations,
            useWidgetDeleteDialog,
        });
    }, [
        dispatch,
        eventDispatch,
        intl,
        widget,
        includeInteractions,
        useWidgetDeleteDialog,
        includeConfigurations,
    ]);

    const menuItems = useMemo<IInsightMenuItem[]>(() => {
        return insightMenuItemsProvider && insight
            ? insightMenuItemsProvider(insight, widget, defaultMenuItems, closeMenu, "edit")
            : defaultMenuItems;
    }, [insightMenuItemsProvider, insight, widget, defaultMenuItems, closeMenu]);

    return { menuItems };
};
