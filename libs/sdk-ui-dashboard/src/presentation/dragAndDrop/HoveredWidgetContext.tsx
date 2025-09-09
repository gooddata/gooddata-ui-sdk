// (C) 2024-2025 GoodData Corporation

import React from "react";

import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { createContextStore } from "@gooddata/sdk-ui";

// Define the shape of the context state
interface HoveredWidgetContextState {
    hoveredWidgets: ObjRef[];
    addHoveredWidget: (widgetRef: ObjRef | null) => void;
    removeHoveredWidget: (widgetRef: ObjRef | null) => void;
    isHovered: (widgetRef: ObjRef, hoveredWidgets: ObjRef[]) => boolean;
}

// Create the context with a default value
export const HoveredWidgetContext = createContextStore<HoveredWidgetContextState>("HoveredWidgets");

export const useHoveredWidgetContextValue = (): HoveredWidgetContextState => {
    const [hoveredWidgets, setHoveredWidgets] = React.useState<ObjRef[]>([]);

    const addHoveredWidget = React.useCallback((widgetRef: ObjRef | null) => {
        setHoveredWidgets((prev) => {
            if (!widgetRef || prev.some((ref) => areObjRefsEqual(ref, widgetRef))) {
                return prev;
            }
            return [...prev, widgetRef];
        });
    }, []);

    const removeHoveredWidget = React.useCallback((widgetRef: ObjRef | null) => {
        setHoveredWidgets((prev) => {
            if (!widgetRef || !prev.some((ref) => areObjRefsEqual(ref, widgetRef))) {
                return prev;
            }
            return prev.filter((ref) => !areObjRefsEqual(ref, widgetRef));
        });
    }, []);

    const isHovered = React.useCallback((widgetRef: ObjRef, hoveredWidgets: ObjRef[]) => {
        return hoveredWidgets.some((ref) => areObjRefsEqual(ref, widgetRef));
    }, []);

    return { hoveredWidgets, addHoveredWidget, removeHoveredWidget, isHovered };
};

export function HoveredWidgetProvider({ children }: { children: React.ReactNode }) {
    return <HoveredWidgetContext value={useHoveredWidgetContextValue()}>{children}</HoveredWidgetContext>;
}
