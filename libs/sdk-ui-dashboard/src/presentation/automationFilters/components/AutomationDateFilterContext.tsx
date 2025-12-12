// (C) 2025 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type FilterContextItem, type IDashboardDateFilter } from "@gooddata/sdk-model";

const AutomationDateFilterContext = createContext<IAutomationDateFilterContext | null>(null);

/**
 * @internal
 */
export interface IAutomationDateFilterContext {
    onDelete: (filter: FilterContextItem) => void;
    filter: IDashboardDateFilter;
    isLocked?: boolean;
    isCommonDateFilter?: boolean;
    deleteAriaLabel?: string;
    deleteTooltipContent?: string;
    lockedTooltipContent?: string;
}

/**
 * @internal
 */
export const useAutomationDateFilterContext = () => {
    const context = useContext(AutomationDateFilterContext);
    if (!context) {
        throw new Error("AutomationDateFilterContext not found");
    }
    return context;
};

export interface IAutomationDateFilterProviderProps extends IAutomationDateFilterContext {
    children: ReactNode;
}

/**
 * @internal
 */
export function AutomationDateFilterProvider({
    children,
    onDelete,
    isLocked,
    isCommonDateFilter,
    filter,
    deleteAriaLabel,
    deleteTooltipContent,
    lockedTooltipContent,
}: IAutomationDateFilterProviderProps) {
    return (
        <AutomationDateFilterContext.Provider
            value={{
                onDelete,
                isLocked,
                isCommonDateFilter,
                filter,
                deleteAriaLabel,
                deleteTooltipContent,
                lockedTooltipContent,
            }}
        >
            {children}
        </AutomationDateFilterContext.Provider>
    );
}
