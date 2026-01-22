// (C) 2021-2026 GoodData Corporation

import { compact } from "lodash-es";
import { type IntlShape } from "react-intl";

import { type IRichTextWidget } from "@gooddata/sdk-model";

import { eagerRemoveSectionItemByWidgetRef } from "../../../../model/commands/layout.js";
import { type useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";
import { type useDashboardEventDispatch } from "../../../../model/react/useDashboardEventDispatch.js";
import { RichTextConfiguration } from "../../richText/configuration/RichTextConfiguration.js";
import { type IRichTextMenuItem } from "../types.js";

/**
 * @internal
 */
export type RichTextMenuItemDependencies = {
    intl: IntlShape;
    dispatch: ReturnType<typeof useDashboardDispatch>;
    eventDispatch: ReturnType<typeof useDashboardEventDispatch>;
    enableRichTextWidgetFilterConfiguration?: boolean;
};

/**
 * @internal
 */
export function getDefaultRichTextEditMode(
    widget: IRichTextWidget,
    { intl, dispatch, enableRichTextWidgetFilterConfiguration = false }: RichTextMenuItemDependencies,
): IRichTextMenuItem[] {
    return compact([
        enableRichTextWidgetFilterConfiguration && {
            type: "submenu",
            itemId: "ConfigurationPanelSubmenu",
            tooltip: "",
            itemName: intl.formatMessage({ id: "configurationPanel.title" }),
            icon: "gd-icon-settings",
            disabled: false,
            className: "s-configuration-panel-submenu",
            SubmenuComponent: RichTextConfiguration,
        },
        enableRichTextWidgetFilterConfiguration && {
            type: "separator",
            itemId: "ConfigurationPanelRemoveSeparator",
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
