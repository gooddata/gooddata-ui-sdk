// (C) 2022-2025 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export function FooterButtons({ children }: { children?: React.ReactNode }) {
    return (
        <span className="gd-widget-footer-buttons">
            <div className="gd-widget-footer-buttons-separator" />
            {children}
        </span>
    );
}
