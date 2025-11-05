// (C) 2021-2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { IRichTextWidget } from "@gooddata/sdk-model";

import {
    selectEnableRichTextWidgetFilterConfiguration,
    useDashboardDispatch,
    useDashboardEventDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { useDashboardCustomizationsContext } from "../../dashboardContexts/index.js";
import { IRichTextMenuItem, getDefaultRichTextEditMode } from "../richTextMenu/index.js";

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

    const { richTextMenuItemsProvider } = useDashboardCustomizationsContext();
    const defaultMenuItems = useMemo<IRichTextMenuItem[]>(() => {
        return getDefaultRichTextEditMode(widget, {
            intl,
            dispatch,
            eventDispatch,
            enableRichTextWidgetFilterConfiguration,
        });
    }, [dispatch, eventDispatch, intl, widget, enableRichTextWidgetFilterConfiguration]);

    const menuItems = useMemo<IRichTextMenuItem[]>(() => {
        return richTextMenuItemsProvider
            ? richTextMenuItemsProvider(widget, defaultMenuItems, closeMenu, "edit")
            : defaultMenuItems;
    }, [richTextMenuItemsProvider, widget, defaultMenuItems, closeMenu]);

    return { menuItems };
};
