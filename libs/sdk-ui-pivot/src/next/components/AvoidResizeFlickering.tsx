// (C) 2025-2026 GoodData Corporation

import { type CSSProperties, type ReactNode, useMemo } from "react";

import { usePivotTableSizing } from "../context/PivotTableSizingContext.js";
import { useTableReady } from "../context/TableReadyContext.js";
import { useInitialAutoResizeVisibility } from "../hooks/resizing/useInitialAutoResizeVisibility.js";

import { LoadingComponent } from "./LoadingComponent.js";

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
 * Component that prevents resize flickering by hiding the table
 * until column sizing calculations are complete.
 *
 * Notifies TableReadyContext when visibility becomes ready,
 * which triggers afterRender when both conditions are met.
 *
 * @alpha
 */
export function AvoidResizeFlickering({ children }: IAvoidResizeFlickeringProps) {
    const { onVisibilityReady } = useTableReady();
    const { containerWidth, isContainerWidthMeasured } = usePivotTableSizing();

    // Pass onReady callback to hook - called directly from effect when ready
    const visibilityOptions = useMemo(() => ({ onReady: onVisibilityReady }), [onVisibilityReady]);
    const isReadyAfterInitialSettle = useInitialAutoResizeVisibility(visibilityOptions);
    const hasContainerWidth = containerWidth > 0;
    const isReadyForInitialPaint = isReadyAfterInitialSettle && hasContainerWidth;
    const isMeasuredAsHidden = isContainerWidthMeasured && !hasContainerWidth;

    return (
        <div style={containerStyle}>
            {!isReadyForInitialPaint && !isMeasuredAsHidden ? (
                <div style={loadingContainerStyle}>
                    <LoadingComponent />
                </div>
            ) : null}
            {children({ isReadyForInitialPaint })}
        </div>
    );
}
