// (C) 2021-2025 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import compact from "lodash/compact.js";

import { IInsightMenuItem } from "../types.js";
import { InsightConfiguration } from "../../insight/configuration/InsightConfiguration.js";
import { InsightInteractions } from "../../insight/configuration/InsightInteractions.js";

import { Icon } from "@gooddata/sdk-ui-kit";
import {
    useDashboardDispatch,
    useDashboardEventDispatch,
    userInteractionTriggered,
    uiActions,
    eagerRemoveSectionItemByWidgetRef,
} from "../../../../model/index.js";
import { IInsightWidget } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type InsightMenuItemDependencies = {
    intl: IntlShape;
    dispatch: ReturnType<typeof useDashboardDispatch>;
    eventDispatch: ReturnType<typeof useDashboardEventDispatch>;
    includeInteractions?: boolean;
    includeConfigurations?: boolean;
    useWidgetDeleteDialog?: boolean;
};

/**
 * @internal
 */
export function getDefaultInsightEditMenuItems(
    widget: IInsightWidget,
    {
        intl,
        dispatch,
        eventDispatch,
        includeInteractions = true,
        includeConfigurations = true,
        useWidgetDeleteDialog = false,
    }: InsightMenuItemDependencies,
): IInsightMenuItem[] {
    return compact([
        includeConfigurations && {
            type: "submenu",
            itemId: "ConfigurationPanelSubmenu",
            tooltip: "",
            itemName: intl.formatMessage({ id: "configurationPanel.title" }),
            icon: "gd-icon-settings",
            disabled: false,
            className: "s-configuration-panel-submenu",
            SubmenuComponent: InsightConfiguration,
        },
        includeInteractions && {
            type: "submenu",
            itemId: "InteractionPanelSubmenu",
            tooltip: "",
            itemName: intl.formatMessage({ id: "configurationPanel.interactions" }),
            icon: <Icon.Interaction className="item-icon" />,
            disabled: false,
            className: "s-configuration-panel-submenu",
            SubmenuComponent: InsightInteractions,
            onClick: () => eventDispatch(userInteractionTriggered("interactionPanelOpened")),
        },
        (includeConfigurations || includeInteractions) && {
            type: "separator",
            itemId: "InteractionPanelRemoveSeparator",
        },
        {
            type: "button",
            itemId: "InteractionPanelRemove",
            tooltip: "",
            itemName: intl.formatMessage({ id: "configurationPanel.remove.form.dashboard" }),
            icon: "gd-icon-trash",
            disabled: false,
            className: "s-delete-insight-item",
            onClick: () =>
                useWidgetDeleteDialog
                    ? dispatch(uiActions.openWidgetDeleteDialog(widget.ref))
                    : dispatch(eagerRemoveSectionItemByWidgetRef(widget.ref)),
        },
    ]);
}
