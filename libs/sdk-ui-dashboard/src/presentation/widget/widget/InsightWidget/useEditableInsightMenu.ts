// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../../../model/react/useDashboardEventDispatch.js";
import {
    selectDashboardUserAutomationAlertsInContext,
    selectDashboardUserAutomationSchedulesInContext,
} from "../../../../model/store/automations/automationsSelectors.js";
import {
    selectEnableAlerting,
    selectEnableScheduling,
} from "../../../../model/store/config/configSelectors.js";
import { selectDrillTargetsByWidgetRef } from "../../../../model/store/drillTargets/drillTargetsSelectors.js";
import { useDashboardCustomizationsContext } from "../../../dashboardContexts/DashboardCustomizationsContext.js";
import { getDefaultInsightEditMenuItems } from "../../insightMenu/DefaultDashboardInsightMenu/getDefaultInsightEditMenuItems.js";
import { type IInsightMenuItem } from "../../insightMenu/types.js";

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
