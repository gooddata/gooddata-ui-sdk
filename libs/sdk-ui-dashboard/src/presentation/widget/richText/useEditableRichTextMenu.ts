// (C) 2021-2025 GoodData Corporation
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { IRichTextWidget } from "@gooddata/sdk-model";

import { useDashboardDispatch, useDashboardEventDispatch } from "../../../model/index.js";
import { getDefaultRichTextEditMode, IRichTextMenuItem } from "../richTextMenu/index.js";
import { useDashboardCustomizationsContext } from "../../dashboardContexts/index.js";

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

    const useWidgetDeleteDialog = useMemo(
        () =>
            // new widgets in edit mode do not have localIdentifier, so should be deleted without confirmation dialog
            !!widget.localIdentifier,
        [widget.localIdentifier],
    );

    const { richTextMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useMemo<IRichTextMenuItem[]>(() => {
        return getDefaultRichTextEditMode(widget, {
            intl,
            dispatch,
            eventDispatch,
            useWidgetDeleteDialog,
        });
    }, [dispatch, eventDispatch, intl, widget, useWidgetDeleteDialog]);

    const menuItems = useMemo<IRichTextMenuItem[]>(() => {
        return richTextMenuItemsProvider
            ? richTextMenuItemsProvider(widget, defaultMenuItems, closeMenu, "edit")
            : defaultMenuItems;
    }, [richTextMenuItemsProvider, widget, defaultMenuItems, closeMenu]);

    return { menuItems };
};
