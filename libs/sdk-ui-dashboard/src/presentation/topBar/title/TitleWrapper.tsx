// (C) 2022 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export const TitleWrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return <div className="dash-title-wrapper">{children}</div>;
};
