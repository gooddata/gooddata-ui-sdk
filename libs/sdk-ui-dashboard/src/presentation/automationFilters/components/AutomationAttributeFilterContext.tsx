// (C) 2025 GoodData Corporation

import React from "react";

import { FilterContextItem, IDashboardAttributeFilter } from "@gooddata/sdk-model";

const AutomationAttributeFilterContext = React.createContext<IAutomationAttributeFilterContext | null>(null);

/**
 * @internal
 */
export interface IAutomationAttributeFilterContext {
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    filter: IDashboardAttributeFilter;
    isLocked?: boolean;
    deleteAriaLabel?: string;
}

/**
 * @internal
 */
export const useAutomationAttributeFilterContext = () => {
    const context = React.useContext(AutomationAttributeFilterContext);
    if (!context) {
        throw new Error("AutomationAttributeFilterContext not found");
    }
    return context;
};

export interface IAutomationAttributeFilterProviderProps extends IAutomationAttributeFilterContext {
    children: React.ReactNode;
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
}: IAutomationAttributeFilterProviderProps) {
    return (
        <AutomationAttributeFilterContext.Provider
            value={{ onChange, onDelete, isLocked, filter, deleteAriaLabel }}
        >
            {children}
        </AutomationAttributeFilterContext.Provider>
    );
}
