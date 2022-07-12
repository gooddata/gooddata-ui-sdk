// (C) 2022 GoodData Corporation
import React, { createContext, ReactNode, useCallback, useContext, useState } from "react";
import noop from "lodash/noop";
import { ReachedHeightResizingLimit } from "./DragLayerPreview/types";

type ResizeDirection = "height" | "width" | "none";

export type LayoutResizeState = {
    resizeDirection: ResizeDirection;
    resizeItemIdentifiers: string[];
    heightLimitReached: ReachedHeightResizingLimit;
};

const initState: LayoutResizeState = {
    resizeDirection: "none",
    resizeItemIdentifiers: [],
    heightLimitReached: "none",
};

export type LayoutResizeHandlers = {
    resizeStart: (direction: Exclude<ResizeDirection, "none">, resizeIdentifiers: string[]) => void;
    toggleHeightLimitReached: (limit: ReachedHeightResizingLimit) => void;
    resizeEnd: () => void;
};

export type LayoutResizeContext = LayoutResizeState & LayoutResizeHandlers;

const LayoutResizeStateContext = createContext<LayoutResizeContext>({
    resizeDirection: "none",
    resizeItemIdentifiers: [],
    heightLimitReached: "none",
    toggleHeightLimitReached: noop,
    resizeStart: noop,
    resizeEnd: noop,
});

export type LayoutResizeStateProviderProps = {
    children: ReactNode;
};

export function LayoutResizeStateProvider({ children }: LayoutResizeStateProviderProps) {
    const [resizeState, setResizeState] = useState<LayoutResizeState>(initState);

    const resizeStart = useCallback((direction: Exclude<ResizeDirection, "none">, identifiers: string[]) => {
        setResizeState({
            resizeDirection: direction,
            resizeItemIdentifiers: identifiers,
            heightLimitReached: "none",
        });
    }, []);

    const toggleHeightLimitReached = useCallback((heightLimitReached: ReachedHeightResizingLimit) => {
        setResizeState((state) => ({
            ...state,
            heightLimitReached,
        }));
    }, []);

    const resizeEnd = useCallback(() => {
        setResizeState(initState);
    }, []);

    return (
        <LayoutResizeStateContext.Provider
            value={{
                ...resizeState,
                toggleHeightLimitReached,
                resizeStart,
                resizeEnd,
            }}
        >
            {children}
        </LayoutResizeStateContext.Provider>
    );
}

export function useResizeContext() {
    return useContext(LayoutResizeStateContext);
}

export function useResizeHandlers(): LayoutResizeHandlers {
    const context = useResizeContext();

    return {
        resizeStart: context.resizeStart,
        toggleHeightLimitReached: context.toggleHeightLimitReached,
        resizeEnd: context.resizeEnd,
    };
}

export function useResizeStatus(identifier: string) {
    const context = useResizeContext();
    return {
        isActive: context.resizeItemIdentifiers.includes(identifier),
        isResizingColumnOrRow: context.resizeDirection !== "none",
        heightLimitReached: context.heightLimitReached,
    };
}
