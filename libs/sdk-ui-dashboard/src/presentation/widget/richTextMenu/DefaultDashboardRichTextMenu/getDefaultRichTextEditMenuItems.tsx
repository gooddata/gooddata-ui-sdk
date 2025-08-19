// (C) 2021-2025 GoodData Corporation
import compact from "lodash/compact.js";
import { IntlShape } from "react-intl";

import { IRichTextWidget } from "@gooddata/sdk-model";

import {
    eagerRemoveSectionItemByWidgetRef,
    useDashboardDispatch,
    useDashboardEventDispatch,
} from "../../../../model/index.js";
import { IRichTextMenuItem } from "../../types.js";

/**
 * @internal
 */
export type RichTextMenuItemDependencies = {
    intl: IntlShape;
    dispatch: ReturnType<typeof useDashboardDispatch>;
    eventDispatch: ReturnType<typeof useDashboardEventDispatch>;
};

/**
 * @internal
 */
export function getDefaultRichTextEditMode(
    widget: IRichTextWidget,
    { intl, dispatch }: RichTextMenuItemDependencies,
): IRichTextMenuItem[] {
    return compact([
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
