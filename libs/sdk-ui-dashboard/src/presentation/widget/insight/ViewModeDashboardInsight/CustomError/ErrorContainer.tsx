// (C) 2007-2021 GoodData Corporation
import React from "react";

const fullHeightWidthStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
};

export const ErrorContainer: React.FC = ({ children }) => {
    return (
        <div className="gd-visualization-content" style={fullHeightWidthStyle}>
            <div className="info-label">
                <div style={fullHeightWidthStyle}>{children}</div>
            </div>
        </div>
    );
};
