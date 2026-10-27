// (C) 2021-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IInsight, type IInsightWidget, canEditVisualization, insightId } from "@gooddata/sdk-model";
import { IconExplore, useMediaQuery } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import {
    selectEnableInsightEditing,
    selectEnableVisualizationPermissions,
} from "../../model/store/config/configSelectors.js";
import {
    selectCanCreateVisualization,
    selectPermissions,
} from "../../model/store/permissions/permissionsSelectors.js";
import { uiActions } from "../../model/store/ui/index.js";
import { type IInsightMenuItem, type IInsightMenuItemButton } from "../widget/insightMenu/types.js";

import { useInsightEditorPermissions } from "./InsightEditorPermissionsContext.js";

export const EXPLORE_INSIGHT_MENU_ITEM_ID = "explore";
export const EXPLORE_INSIGHT_SEPARATOR_ID = "explore-separator";
export const EDIT_INSIGHT_MENU_ITEM_ID = "options-menu-edit-insight";
export const EDIT_INSIGHT_SEPARATOR_ID = "edit-insight-separator";
const REMOVE_MENU_ITEM_ID = "InteractionPanelRemove";

/**
 * The "Explore from here" item of the widget menu in view mode.
 */
export function useExploreInsightMenuItem(
    insight: IInsight | undefined,
    widget: IInsightWidget,
    closeMenu: () => void,
): IInsightMenuItemButton | undefined {
    const intl = useIntl();
    const theme = useTheme();
    const dispatch = useDashboardDispatch();
    const isEnabled = useDashboardSelector(selectEnableInsightEditing);
    const canCreateVisualization = useDashboardSelector(selectCanCreateVisualization);
    const isMobile = useMediaQuery("mobileDevice");
    const iconColor = theme?.palette?.complementary?.c5;

    return useMemo(() => {
        // Explore opens a draft the user may save as a new visualization, so it is a create path.
        if (!isEnabled || !insight || !canCreateVisualization || isMobile) {
            return undefined;
        }
        return {
            type: "button",
            itemId: EXPLORE_INSIGHT_MENU_ITEM_ID,
            className: "s-options-menu-explore-insight",
            itemName: intl.formatMessage({ id: "insightEditor.menu.explore" }),
            icon: (
                <IconExplore className="gd-icon-explore gd-icon-explore-sdk" color={iconColor} ariaHidden />
            ),
            onClick: () => {
                dispatch(uiActions.openInsightEditor({ type: "widget", ref: widget.ref }));
                closeMenu();
            },
        };
    }, [
        isEnabled,
        insight,
        canCreateVisualization,
        isMobile,
        intl,
        iconColor,
        dispatch,
        widget.ref,
        closeMenu,
    ]);
}

/**
 * The "Edit" item of the widget menu in edit mode.
 */
export function useEditInsightMenuItem(
    insight: IInsight | undefined,
    widget: IInsightWidget,
): IInsightMenuItemButton | undefined {
    const intl = useIntl();
    const dispatch = useDashboardDispatch();
    const isEnabled = useDashboardSelector(selectEnableInsightEditing);
    const workspacePermissions = useDashboardSelector(selectPermissions);
    const visualizationPermissionsEnabled = useDashboardSelector(selectEnableVisualizationPermissions);
    const insightPermissions = useInsightEditorPermissions();

    return useMemo(() => {
        // Editing a visualization follows the right to save it in place, not the right to create one.
        const canEditInsight =
            isEnabled &&
            !!insight &&
            !!workspacePermissions &&
            canEditVisualization(
                insightPermissions?.[insightId(insight)],
                workspacePermissions,
                visualizationPermissionsEnabled,
            );
        if (!canEditInsight) {
            return undefined;
        }
        return {
            type: "button",
            itemId: EDIT_INSIGHT_MENU_ITEM_ID,
            className: "s-options-menu-edit-insight",
            itemName: intl.formatMessage({ id: "controlButtons.edit.value" }),
            icon: "gd-icon-pencil",
            onClick: () => {
                dispatch(uiActions.openInsightEditor({ type: "widget", ref: widget.ref }));
            },
        };
    }, [
        isEnabled,
        insight,
        workspacePermissions,
        insightPermissions,
        visualizationPermissionsEnabled,
        intl,
        dispatch,
        widget.ref,
    ]);
}

/**
 * Puts the explore item first, separated from the other items.
 */
export function addExploreMenuItem(
    items: IInsightMenuItem[],
    exploreItem: IInsightMenuItemButton | undefined,
): IInsightMenuItem[] {
    if (!exploreItem) {
        return items;
    }
    const needsSeparator = items.length > 0 && items[0].type !== "separator";
    return [
        exploreItem,
        ...(needsSeparator ? [{ type: "separator" as const, itemId: EXPLORE_INSIGHT_SEPARATOR_ID }] : []),
        ...items,
    ];
}

/**
 * Puts the edit item last, but before the remove item, which stays the last one.
 */
export function addEditMenuItem(
    items: IInsightMenuItem[],
    editItem: IInsightMenuItemButton | undefined,
): IInsightMenuItem[] {
    if (!editItem) {
        return items;
    }
    const removeItem = items.find((item) => item.itemId === REMOVE_MENU_ITEM_ID);
    const otherItems = items.filter((item) => item !== removeItem);
    return [
        ...otherItems,
        editItem,
        ...(items.length > 0 ? [{ type: "separator" as const, itemId: EDIT_INSIGHT_SEPARATOR_ID }] : []),
        ...(removeItem ? [removeItem] : []),
    ];
}
