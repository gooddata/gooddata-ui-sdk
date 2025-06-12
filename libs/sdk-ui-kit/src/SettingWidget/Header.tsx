// (C) 2022 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export const Header: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <div className="gd-widget-header">{children}</div>
);
