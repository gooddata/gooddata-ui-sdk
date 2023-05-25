// (C) 2021-2023 GoodData Corporation
import React from "react";
import { IntlShape } from "react-intl";
import compact from "lodash/compact.js";

import { IInsightMenuItem } from "../types.js";
import { InsightConfiguration } from "../../insight/configuration/InsightConfiguration.js";
import { InsightInteractions } from "../../insight/configuration/InsightInteractions.js";

import { Icon } from "@gooddata/sdk-ui-kit";
import { useDashboardDispatch, eagerRemoveSectionItemByWidgetRef } from "../../../../model/index.js";
import { IInsightWidget } from "@gooddata/sdk-model";

/**
 * @internal
 */
export type MenuItemDependencies = {
    intl: IntlShape;
    dispatch: ReturnType<typeof useDashboardDispatch>;
    includeInteractions?: boolean;
};

/**
 * @internal
 */
export function getDefaultInsightEditMenuItems(
    widget: IInsightWidget,
    { intl, dispatch, includeInteractions = true }: MenuItemDependencies,
): IInsightMenuItem[] {
    return compact([
        {
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
        },
        {
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
            onClick: () => dispatch(eagerRemoveSectionItemByWidgetRef(widget.ref)),
        },
    ]);
}
