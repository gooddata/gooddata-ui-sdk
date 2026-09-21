// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IRichTextWidget } from "@gooddata/sdk-model";

import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../../model/react/useDashboardEventDispatch.js";
import { useIsWidgetRestricted } from "../../../model/react/useIsWidgetRestricted.js";
import { selectEnableRichTextWidgetFilterConfiguration } from "../../../model/store/config/configSelectors.js";
import { useDashboardCustomizationsContext } from "../../dashboardContexts/DashboardCustomizationsContext.js";
import { getDefaultRichTextEditMode } from "../richTextMenu/DefaultDashboardRichTextMenu/getDefaultRichTextEditMenuItems.js";
import { type IRichTextMenuItem } from "../richTextMenu/types.js";

type UseEditableRichTextMenuConfig = {
    widget: IRichTextWidget;
    closeMenu: () => void;
};

export const useEditableRichTextMenu = (
    config: UseEditableRichTextMenuConfig,
): { menuItems: IRichTextMenuItem[] } => {
    const { widget, closeMenu } = config;

    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const eventDispatch = useDashboardEventDispatch();
    const enableRichTextWidgetFilterConfiguration = useDashboardSelector(
        selectEnableRichTextWidgetFilterConfiguration,
    );
    // there is nothing to configure about a reference the editor is not allowed to read, so the
    // menu of such a widget holds removal alone
    const isRestricted = useIsWidgetRestricted(widget);

    const { richTextMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useMemo<IRichTextMenuItem[]>(() => {
        return getDefaultRichTextEditMode(widget, {
            intl,
            dispatch,
            eventDispatch,
            enableRichTextWidgetFilterConfiguration: enableRichTextWidgetFilterConfiguration && !isRestricted,
        });
    }, [dispatch, eventDispatch, intl, widget, enableRichTextWidgetFilterConfiguration, isRestricted]);

    const menuItems = useMemo<IRichTextMenuItem[]>(() => {
        return richTextMenuItemsProvider
            ? richTextMenuItemsProvider(widget, defaultMenuItems, closeMenu, "edit")
            : defaultMenuItems;
    }, [richTextMenuItemsProvider, widget, defaultMenuItems, closeMenu]);

    return { menuItems };
};
