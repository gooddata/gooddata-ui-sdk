// (C) 2025 GoodData Corporation

import { ReactNode, createContext, useContext } from "react";

import { FilterContextItem, IDashboardDateFilter } from "@gooddata/sdk-model";

const AutomationDateFilterContext = createContext<IAutomationDateFilterContext | null>(null);

/**
 * @internal
 */
export interface IAutomationDateFilterContext {
    onDelete: (filter: FilterContextItem) => void;
    filter: IDashboardDateFilter;
    isLocked?: boolean;
    isCommonDateFilter?: boolean;
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
}: IAutomationDateFilterProviderProps) {
    return (
        <AutomationDateFilterContext.Provider value={{ onDelete, isLocked, isCommonDateFilter, filter }}>
            {children}
        </AutomationDateFilterContext.Provider>
    );
}
