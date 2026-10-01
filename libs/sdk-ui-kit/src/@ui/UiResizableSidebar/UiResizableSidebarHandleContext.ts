// (C) 2026 GoodData Corporation

import { type PointerEvent as ReactPointerEvent, createContext } from "react";

export interface IUiResizableSidebarHandleContext {
    width: number;
    min: number;
    max: number;
    canResize: boolean;
    isDragging: boolean;
    dragWidth: number | null;
    keyboardStep: number;
    setWidth: (width: number) => void;
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => void;
    onLostPointerCapture: () => void;
}

export const UiResizableSidebarHandleContext = createContext<IUiResizableSidebarHandleContext | undefined>(
    undefined,
);
UiResizableSidebarHandleContext.displayName = "UiResizableSidebarHandleContext";
