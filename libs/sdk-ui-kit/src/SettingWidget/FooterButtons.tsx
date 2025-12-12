// (C) 2022-2025 GoodData Corporation

import { type ReactNode } from "react";

/**
 * @internal
 */
export function FooterButtons({ children }: { children?: ReactNode }) {
    return (
        <span className="gd-widget-footer-buttons">
            <div className="gd-widget-footer-buttons-separator" />
            {children}
        </span>
    );
}
