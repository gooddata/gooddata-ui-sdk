// (C) 2025 GoodData Corporation

import { CSSProperties, ReactNode } from "react";

import { LoadingComponent } from "./LoadingComponent.js";
import { useInitialAutoResizeVisibility } from "../hooks/resizing/useInitialAutoResizeVisibility.js";

/**
 * @internal
 */
export interface IAvoidResizeFlickeringProps {
    children: (props: { isReadyForInitialPaint: boolean }) => ReactNode;
}

const containerStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
};

const loadingContainerStyle: CSSProperties = {
    position: "absolute",
    height: "100%",
    width: "100%",
    zIndex: 9999,
};

/**
 * Pivot table next loading component.
 *
 * @alpha
 */
export function AvoidResizeFlickering({ children }: IAvoidResizeFlickeringProps) {
    const isReadyForInitialPaint = useInitialAutoResizeVisibility();

    return (
        <div style={containerStyle}>
            {isReadyForInitialPaint ? null : (
                <div style={loadingContainerStyle}>
                    <LoadingComponent />
                </div>
            )}
            {children({ isReadyForInitialPaint })}
        </div>
    );
}
