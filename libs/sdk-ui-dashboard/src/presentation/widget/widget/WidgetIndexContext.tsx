// (C) 2025 GoodData Corporation
import { createContext, useContext, ReactNode } from "react";

/**
 * @internal
 */
interface IWidgetIndexContextValue {
    index: number | undefined;
}

const WidgetIndexContext = createContext<IWidgetIndexContextValue | undefined>(undefined);

/**
 * @internal
 */
export interface IWidgetIndexProviderProps {
    index: number | undefined;
    children: ReactNode;
}

/**
 * @internal
 */
export function WidgetIndexProvider({ index, children }: IWidgetIndexProviderProps) {
    return <WidgetIndexContext.Provider value={{ index }}>{children}</WidgetIndexContext.Provider>;
}

/**
 * @internal
 */
export function useWidgetIndex(): number | undefined {
    const context = useContext(WidgetIndexContext);
    return context?.index;
}
