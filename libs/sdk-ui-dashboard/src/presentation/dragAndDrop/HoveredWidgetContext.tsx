// (C) 2024 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context state
interface HoveredWidgetContextState {
    hoveredWidget: ObjRef | null;
    setHoveredWidget: (widgetRef: ObjRef | null) => void;
}

// Create the context with a default value
const HoveredWidgetContext = createContext<HoveredWidgetContextState | undefined>(undefined);

// Create the provider component
export const HoveredWidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [hoveredWidget, setHoveredWidget] = useState<ObjRef | null>(null);

    return (
        <HoveredWidgetContext.Provider value={{ hoveredWidget, setHoveredWidget }}>
            {children}
        </HoveredWidgetContext.Provider>
    );
};

// Custom hook to use the HoveredWidgetContext
export const useHoveredWidget = (): HoveredWidgetContextState => {
    const context = useContext(HoveredWidgetContext);
    if (!context) {
        throw new Error("useHoveredWidget must be used within a HoveredWidgetProvider");
    }
    return context;
};
