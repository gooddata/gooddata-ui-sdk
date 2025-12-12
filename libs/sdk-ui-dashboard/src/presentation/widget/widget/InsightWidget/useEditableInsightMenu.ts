// (C) 2021-2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import {
    selectDashboardUserAutomationAlertsInContext,
    selectDashboardUserAutomationSchedulesInContext,
    selectDrillTargetsByWidgetRef,
    selectEnableAlerting,
    selectEnableScheduling,
    useDashboardDispatch,
    useDashboardEventDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardCustomizationsContext } from "../../../dashboardContexts/index.js";
import { type IInsightMenuItem, getDefaultInsightEditMenuItems } from "../../insightMenu/index.js";

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

    const configItems = useDashboardSelector(selectDrillTargetsByWidgetRef(widget.ref));
    const availableDrillTargets = configItems?.availableDrillTargets;
    const someAvailableDrillTargetsExist =
        !!availableDrillTargets?.attributes?.length || !!availableDrillTargets?.measures?.length;

    const includeInteractions = someAvailableDrillTargetsExist && Boolean(insight);
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
