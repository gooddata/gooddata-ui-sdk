// (C) 2025-2026 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type DashboardAttributeFilterItem, type FilterContextItem } from "@gooddata/sdk-model";

const AutomationAttributeFilterContext = createContext<IAutomationAttributeFilterContext | null>(null);

/**
 * @internal
 */
export interface IAutomationAttributeFilterContext {
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    filter: DashboardAttributeFilterItem;
    isLocked?: boolean;
    deleteAriaLabel?: string;
    deleteTooltipContent?: string;
    lockedTooltipContent?: string;
}

/**
 * @internal
 */
export const useAutomationAttributeFilterContext = () => {
    const context = useContext(AutomationAttributeFilterContext);
    if (!context) {
        throw new Error("AutomationAttributeFilterContext not found");
    }
    return context;
};

export interface IAutomationAttributeFilterProviderProps extends IAutomationAttributeFilterContext {
    children: ReactNode;
}
/**
 * @internal
 */
export function AutomationAttributeFilterProvider({
    children,
    onChange,
    onDelete,
    isLocked,
    filter,
    deleteAriaLabel,
    deleteTooltipContent,
    lockedTooltipContent,
}: IAutomationAttributeFilterProviderProps) {
    return (
        <AutomationAttributeFilterContext.Provider
            value={{
                onChange,
                onDelete,
                isLocked,
                filter,
                deleteAriaLabel,
                deleteTooltipContent,
                lockedTooltipContent,
            }}
        >
            {children}
        </AutomationAttributeFilterContext.Provider>
    );
}
