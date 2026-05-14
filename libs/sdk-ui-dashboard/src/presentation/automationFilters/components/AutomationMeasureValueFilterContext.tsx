// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type FilterContextItem, type IDashboardMeasureValueFilter } from "@gooddata/sdk-model";

const AutomationMeasureValueFilterContext = createContext<IAutomationMeasureValueFilterContext | null>(null);

/**
 * @internal
 */
export interface IAutomationMeasureValueFilterContext {
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    filter: IDashboardMeasureValueFilter;
    isLocked?: boolean;
    deleteAriaLabel?: string;
    deleteTooltipContent?: string;
    lockedTooltipContent?: string;
}

/**
 * @internal
 */
export const useAutomationMeasureValueFilterContext = () => {
    const context = useContext(AutomationMeasureValueFilterContext);
    if (!context) {
        throw new Error("AutomationMeasureValueFilterContext not found");
    }
    return context;
};

export interface IAutomationMeasureValueFilterProviderProps extends IAutomationMeasureValueFilterContext {
    children: ReactNode;
}

/**
 * @internal
 */
export function AutomationMeasureValueFilterProvider({
    children,
    onChange,
    onDelete,
    isLocked,
    filter,
    deleteAriaLabel,
    deleteTooltipContent,
    lockedTooltipContent,
}: IAutomationMeasureValueFilterProviderProps) {
    return (
        <AutomationMeasureValueFilterContext.Provider
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
        </AutomationMeasureValueFilterContext.Provider>
    );
}
