// (C) 2022-2025 GoodData Corporation
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import noop from "lodash/noop.js";
import { XYCoord } from "react-dnd";

import { emptyDOMRect } from "../constants.js";

import { ReachedResizingLimit } from "./DragLayerPreview/types.js";

type ResizeDirection = "height" | "width" | "none";
type WidthState = {
    initialIndex: number;
    currentIndex: number;
    limitReached: ReachedResizingLimit;
};

export type LayoutResizeState = {
    resizeDirection: ResizeDirection;
    resizeItemIdentifiers: string[];
    heightLimitReached: ReachedResizingLimit;
    widthState: null | WidthState;
    initialDashboardDimensions: DOMRect;
    isItemNested: undefined | boolean;
};

const initState: LayoutResizeState = {
    resizeDirection: "none",
    resizeItemIdentifiers: [],
    heightLimitReached: "none",
    widthState: null,
    initialDashboardDimensions: emptyDOMRect,
    isItemNested: undefined,
};

export type LayoutResizeHandlers = {
    resizeStart: (
        direction: Exclude<ResizeDirection, "none">,
        resizeIdentifiers: string[],
        isItemNested: boolean,
        getDashboardDimensions?: () => DOMRect,
    ) => void;
    resizeEnd: () => void;
    setScrollCorrection: (scrollCorrection: XYCoord) => void;
    getScrollCorrection: () => XYCoord;
    setWidthState: (widthState: WidthState) => void;
    toggleHeightLimitReached: (limit: ReachedResizingLimit) => void;
};

export type LayoutResizeContext = LayoutResizeState & LayoutResizeHandlers;

const LayoutResizeStateContext = createContext<LayoutResizeContext>({
    resizeDirection: "none",
    resizeItemIdentifiers: [],
    heightLimitReached: "none",
    widthState: null,
    initialDashboardDimensions: emptyDOMRect,
    resizeStart: noop,
    resizeEnd: noop,
    setScrollCorrection: noop,
    getScrollCorrection: () => ({ x: 0, y: 0 }),
    setWidthState: noop,
    toggleHeightLimitReached: noop,
    isItemNested: undefined,
});

export type LayoutResizeStateProviderProps = {
    children: ReactNode;
};

export function LayoutResizeStateProvider({ children }: LayoutResizeStateProviderProps) {
    const scrollingCorrectionRef = useRef<XYCoord>({ x: 0, y: 0 });
    const [resizeState, setResizeState] = useState<LayoutResizeState>(initState);

    const resizeStart = useCallback(
        (
            direction: Exclude<ResizeDirection, "none">,
            identifiers: string[],
            isItemNested: boolean,
            getDashboardDimensions?: () => DOMRect,
        ) => {
            setResizeState({
                heightLimitReached: "none",
                initialDashboardDimensions: getDashboardDimensions ? getDashboardDimensions() : emptyDOMRect,
                resizeDirection: direction,
                resizeItemIdentifiers: identifiers,
                widthState: null,
                isItemNested,
            });
        },
        [],
    );

    const toggleHeightLimitReached = useCallback((heightLimitReached: ReachedResizingLimit) => {
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

    const setScrollCorrection = useCallback((scrollCorrection: XYCoord) => {
        scrollingCorrectionRef.current = scrollCorrection;
    }, []);

    const getScrollCorrection = useCallback(() => {
        return scrollingCorrectionRef.current;
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
                setScrollCorrection,
                getScrollCorrection,
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
        setScrollCorrection: context.setScrollCorrection,
        getScrollCorrection: context.getScrollCorrection,
    };
}

export function useResizeItemStatus(identifier: string) {
    const context = useResizeContext();
    return {
        isActive: context.resizeItemIdentifiers.includes(identifier),
        isResizingColumnOrRow: context.resizeDirection !== "none",
        heightLimitReached: context.heightLimitReached,
        widthLimitReached: context.widthState?.limitReached ?? "none",
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
    | ({ isResizingWidth: true; isItemNested: boolean } & WidthState) {
    const context = useResizeContext();
    return {
        isResizingWidth: context.resizeDirection === "width",
        isItemNested: !!context.isItemNested,
        ...(context.widthState as WidthState),
    };
}
