// (C) 2022-2024 GoodData Corporation

import { type ReactNode } from "react";

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
    titleTooltipText?: ReactNode;
    titleTooltipHideDelay?: number;
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
    renderSubtitle?: () => ReactNode;
}
