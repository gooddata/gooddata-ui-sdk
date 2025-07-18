// (C) 2007-2025 GoodData Corporation
import { CSSProperties, ReactNode } from "react";

const fullHeightWidthStyle: CSSProperties = {
    height: "100%",
    width: "100%",
};

export function ErrorContainer({ children }: { children?: ReactNode }) {
    return (
        <div className="gd-visualization-content" style={fullHeightWidthStyle}>
            <div className="info-label">
                <div style={fullHeightWidthStyle}>{children}</div>
            </div>
        </div>
    );
}
