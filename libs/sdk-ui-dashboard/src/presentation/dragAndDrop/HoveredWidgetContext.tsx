// (C) 2024-2025 GoodData Corporation
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { createContext, ReactNode, useContext, useState } from "react";

// Define the shape of the context state
interface HoveredWidgetContextState {
    hoveredWidgets: ObjRef[] | null;
    addHoveredWidget: (widgetRef: ObjRef | null) => void;
    removeHoveredWidget: (widgetRef: ObjRef | null) => void;
    isHovered: (widgetRef: ObjRef) => boolean;
}

// Create the context with a default value
const HoveredWidgetContext = createContext<HoveredWidgetContextState | undefined>(undefined);

// Create the provider component
export function HoveredWidgetProvider({ children }: { children: ReactNode }) {
    const [hoveredWidgets, setHoveredWidget] = useState<ObjRef[]>([]);

    const addHoveredWidget = (widgetRef: ObjRef | null) => {
        if (widgetRef && !hoveredWidgets?.some((ref) => areObjRefsEqual(ref, widgetRef))) {
            setHoveredWidget((prevWidgets) => [...(prevWidgets || []), widgetRef]);
        }
    };

    const removeHoveredWidget = (widgetRef: ObjRef | null) => {
        if (widgetRef && hoveredWidgets) {
            setHoveredWidget(
                (prevWidgets) => prevWidgets?.filter((ref) => !areObjRefsEqual(ref, widgetRef)) ?? [],
            );
        }
    };

    const isHovered = (widgetRef: ObjRef) => {
        return hoveredWidgets?.some((ref) => areObjRefsEqual(ref, widgetRef)) || false;
    };

    return (
        <HoveredWidgetContext.Provider
            value={{ hoveredWidgets, addHoveredWidget, removeHoveredWidget, isHovered }}
        >
            {children}
        </HoveredWidgetContext.Provider>
    );
}

// Custom hook to use the HoveredWidgetContext
export const useHoveredWidget = (): HoveredWidgetContextState => {
    const context = useContext(HoveredWidgetContext);
    if (!context) {
        throw new Error("useHoveredWidget must be used within a HoveredWidgetProvider");
    }
    return context;
};
