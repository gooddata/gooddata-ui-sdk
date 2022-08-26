// (C) 2022 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export const FooterButtons: React.FC = ({ children }) => (
    <span className="gd-widget-footer-buttons">
        <div className="gd-widget-footer-buttons-separator" />
        {children}
    </span>
);
