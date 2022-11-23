// (C) 2022 GoodData Corporation

import { ReactNode } from "react";

/**
 * @internal
 */
export type ActionType = "LinkButton" | "Button" | "Switcher";

/**
 * @internal
 */
export interface ISettingItem {
    className?: string;
    title: string;
    titleTooltipText?: string;
    alignPointTitleTooltip?: { align: string }[];
    value: string | ReactNode;
    actionType: ActionType;
    actionValue: string | boolean;
    actionTooltipText?: string;
    alignPointActionTooltip?: { align: string }[];
    isLoading?: boolean;
    isDisableAction?: boolean;
    hasDivider?: boolean;
    onAction?: () => void;
}
