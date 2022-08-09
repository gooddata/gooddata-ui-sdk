// (C) 2021-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import { IInsightWidget } from "@gooddata/sdk-model";
import compact from "lodash/compact";

import { IInsightMenuItem } from "../types";
import { createInsightConfigurationScreen } from "../../insight/configuration/InsightConfiguration";
import { createInsightInteractionsScreen } from "../../insight/configuration/InsightInteractions";

/**
 * @internal
 */
export function getDefaultInsightEditMenuItems(
    intl: IntlShape,
    config: {
        widget: IInsightWidget;
    },
): IInsightMenuItem[] {
    const { widget } = config;

    return compact([
        {
            type: "submenu",
            itemId: "ConfigurationPanelSubmenu",
            tooltip: "",
            itemName: intl.formatMessage({ id: "configurationPanel.title" }),
            icon: "gd-icon-settings",
            disabled: false,
            className: "s-configuration-panel-submenu",
            renderSubmenu: () => createInsightConfigurationScreen(widget),
        },
        {
            type: "submenu",
            itemId: "InteractionPanelSubmenu",
            tooltip: "",
            itemName: intl.formatMessage({ id: "configurationPanel.interactions" }),
            icon: "gd-icon-settings",
            disabled: false,
            className: "s-configuration-panel-submenu",
            renderSubmenu: () => createInsightInteractionsScreen(widget),
        },
    ]);
}
