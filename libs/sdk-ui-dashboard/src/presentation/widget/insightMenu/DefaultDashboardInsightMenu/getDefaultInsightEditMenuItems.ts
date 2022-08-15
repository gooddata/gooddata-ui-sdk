// (C) 2021-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import compact from "lodash/compact";

import { IInsightMenuItem } from "../types";
import { InsightConfiguration } from "../../insight/configuration/InsightConfiguration";
import { InsightInteractions } from "../../insight/configuration/InsightInteractions";

/**
 * @internal
 */
export function getDefaultInsightEditMenuItems(intl: IntlShape): IInsightMenuItem[] {
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
        {
            type: "submenu",
            itemId: "InteractionPanelSubmenu",
            tooltip: "",
            itemName: intl.formatMessage({ id: "configurationPanel.interactions" }),
            icon: "gd-icon-settings",
            disabled: false,
            className: "s-configuration-panel-submenu",
            SubmenuComponent: InsightInteractions,
        },
    ]);
}
