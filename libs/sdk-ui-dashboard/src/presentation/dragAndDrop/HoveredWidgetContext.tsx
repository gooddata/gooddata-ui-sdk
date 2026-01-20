// (C) 2024-2026 GoodData Corporation

import { type ReactNode, useCallback, useState } from "react";

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { createContextStore } from "@gooddata/sdk-ui";

// Define the shape of the context state
interface IHoveredWidgetContextState {
    hoveredWidgets: ObjRef[];
    addHoveredWidget: (widgetRef: ObjRef | null) => void;
    removeHoveredWidget: (widgetRef: ObjRef | null) => void;
    isHovered: (widgetRef: ObjRef, hoveredWidgets: ObjRef[]) => boolean;
}

// Create the context with a default value
export const HoveredWidgetContext = createContextStore<IHoveredWidgetContextState>("HoveredWidgets");

export const useHoveredWidgetContextValue = (): IHoveredWidgetContextState => {
    const [hoveredWidgets, setHoveredWidgets] = useState<ObjRef[]>([]);

    const addHoveredWidget = useCallback((widgetRef: ObjRef | null) => {
        setHoveredWidgets((prev) => {
            if (!widgetRef || prev.some((ref) => areObjRefsEqual(ref, widgetRef))) {
                return prev;
            }
            return [...prev, widgetRef];
        });
    }, []);

    const removeHoveredWidget = useCallback((widgetRef: ObjRef | null) => {
        setHoveredWidgets((prev) => {
            if (!widgetRef || !prev.some((ref) => areObjRefsEqual(ref, widgetRef))) {
                return prev;
            }
            return prev.filter((ref) => !areObjRefsEqual(ref, widgetRef));
        });
    }, []);

    const isHovered = useCallback((widgetRef: ObjRef, hoveredWidgets: ObjRef[]) => {
        return hoveredWidgets.some((ref) => areObjRefsEqual(ref, widgetRef));
    }, []);

    return { hoveredWidgets, addHoveredWidget, removeHoveredWidget, isHovered };
};

export function HoveredWidgetProvider({ children }: { children: ReactNode }) {
    return <HoveredWidgetContext value={useHoveredWidgetContextValue()}>{children}</HoveredWidgetContext>;
}
