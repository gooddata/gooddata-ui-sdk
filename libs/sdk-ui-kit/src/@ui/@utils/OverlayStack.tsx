// (C) 2025 GoodData Corporation
import React, { ReactNode, createContext, useContext, useMemo } from "react";

type OverlayContextType = {
    zIndex: number;
};

const OverlayContext = createContext<OverlayContextType>({
    zIndex: 1,
});

export const DEFAULT_ELEVATION = 10;

/**
 * @internal
 */
export type OverlayProviderProps = {
    children?: ReactNode;
    elevation?: number;
    zIndex?: number;
};

/**
 * @internal
 */
export function OverlayProvider({ children, elevation = DEFAULT_ELEVATION, zIndex }: OverlayProviderProps) {
    const parent = useContext(OverlayContext);
    const value = useMemo(() => {
        return {
            zIndex: zIndex ?? parent.zIndex + elevation,
        };
    }, [parent.zIndex, elevation, zIndex]);

    return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

/**
 * @internal
 */
export function OverlayContent({ children }: { children: (data: { zIndex: number }) => ReactNode }) {
    const current = useContext(OverlayContext);
    return children({ zIndex: current.zIndex });
}
