// (C) 2022 GoodData Corporation
import React, { createContext, ReactNode, useCallback, useContext, useState } from "react";
import noop from "lodash/noop";
import { ReachedHeightResizingLimit } from "./DragLayerPreview/types";
import { emptyDOMRect } from "../layout/constants";

type ResizeDirection = "height" | "width" | "none";
type WidthState = {
    initialIndex: number;
    currentIndex: number;
    limitReached: boolean;
};

export type LayoutResizeState = {
    resizeDirection: ResizeDirection;
    resizeItemIdentifiers: string[];
    heightLimitReached: ReachedHeightResizingLimit;
    widthState: null | WidthState;
    initialDashboardDimensions: DOMRect;
};

const initState: LayoutResizeState = {
    resizeDirection: "none",
    resizeItemIdentifiers: [],
    heightLimitReached: "none",
    widthState: null,
    initialDashboardDimensions: emptyDOMRect,
};

export type LayoutResizeHandlers = {
    resizeStart: (
        direction: Exclude<ResizeDirection, "none">,
        resizeIdentifiers: string[],
        getDashboardDimensions?: () => DOMRect,
    ) => void;
    toggleHeightLimitReached: (limit: ReachedHeightResizingLimit) => void;
    setWidthState: (widthState: WidthState) => void;
    resizeEnd: () => void;
};

export type LayoutResizeContext = LayoutResizeState & LayoutResizeHandlers;

const LayoutResizeStateContext = createContext<LayoutResizeContext>({
    resizeDirection: "none",
    resizeItemIdentifiers: [],
    heightLimitReached: "none",
    widthState: null,
    initialDashboardDimensions: emptyDOMRect,
    toggleHeightLimitReached: noop,
    setWidthState: noop,
    resizeStart: noop,
    resizeEnd: noop,
});

export type LayoutResizeStateProviderProps = {
    children: ReactNode;
};

export function LayoutResizeStateProvider({ children }: LayoutResizeStateProviderProps) {
    const [resizeState, setResizeState] = useState<LayoutResizeState>(initState);

    const resizeStart = useCallback(
        (
            direction: Exclude<ResizeDirection, "none">,
            identifiers: string[],
            getDashboardDimensions?: () => DOMRect,
        ) => {
            setResizeState({
                resizeDirection: direction,
                resizeItemIdentifiers: identifiers,
                heightLimitReached: "none",
                widthState: null,
                initialDashboardDimensions: getDashboardDimensions ? getDashboardDimensions() : emptyDOMRect,
            });
        },
        [],
    );

    const toggleHeightLimitReached = useCallback((heightLimitReached: ReachedHeightResizingLimit) => {
        setResizeState((state) => ({
            ...state,
            heightLimitReached,
        }));
    }, []);

    const setWidthState = useCallback((widthState: WidthState) => {
        setResizeState((state) => ({
            ...state,
            widthState,
        }));
    }, []);

    const resizeEnd = useCallback(() => {
        setResizeState(initState);
    }, []);

    return (
        <LayoutResizeStateContext.Provider
            value={{
                ...resizeState,
                resizeStart,
                resizeEnd,
                setWidthState,
                toggleHeightLimitReached,
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
        setWidthState: context.setWidthState,
    };
}

export function useResizeItemStatus(identifier: string) {
    const context = useResizeContext();
    return {
        isActive: context.resizeItemIdentifiers.includes(identifier),
        isResizingColumnOrRow: context.resizeDirection !== "none",
        heightLimitReached: context.heightLimitReached,
        widthLimitReached: context.widthState?.limitReached ?? false,
        initialDashboardDimensions: context.initialDashboardDimensions,
    };
}

export function useResizeWidthItemStatus(identifier: string) {
    const context = useResizeContext();
    return {
        isWidthResizing: context.resizeDirection === "width",
        isActive: context.resizeItemIdentifiers.includes(identifier),
        widthState: context.widthState,
    };
}

export function useResizeWidthStatus():
    | { isResizingWidth: false }
    | ({ isResizingWidth: true } & WidthState) {
    const context = useResizeContext();
    return {
        isResizingWidth: context.resizeDirection === "width",
        ...(context.widthState as WidthState),
    };
}
