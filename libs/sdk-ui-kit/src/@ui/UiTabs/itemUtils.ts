// (C) 2025-2026 GoodData Corporation

import { type IUiMenuSeparatorItem } from "../UiMenu/types.js";

import { type IUiTab, type IUiTabAction } from "./types.js";

/**
 * @internal
 */
export function isSeparatorAction<
    TTabProps extends Record<any, any>,
    TTabActionProps extends Record<any, any>,
>(action: IUiTabAction<TTabProps, TTabActionProps> | IUiMenuSeparatorItem): action is IUiMenuSeparatorItem {
    return "type" in action && action.type === "separator";
}

/**
 * @internal
 */
export function hasInteractiveTabActions<
    TTabProps extends Record<any, any>,
    TTabActionProps extends Record<any, any>,
>(tab: IUiTab<TTabProps, TTabActionProps>): boolean {
    return (tab.actions ?? []).some((action) => !isSeparatorAction(action));
}
