// (C) 2007-2025 GoodData Corporation
import React from "react";

const fullHeightWidthStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
};

export function ErrorContainer({ children }: { children?: React.ReactNode }) {
    return (
        <div className="gd-visualization-content" style={fullHeightWidthStyle}>
            <div className="info-label">
                <div style={fullHeightWidthStyle}>{children}</div>
            </div>
        </div>
    );
}
