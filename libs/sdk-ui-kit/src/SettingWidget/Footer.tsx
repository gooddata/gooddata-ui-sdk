// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

/**
 * @internal
 */
export function Footer({ children }: { children?: ReactNode }) {
    return <div className="gd-widget-footer">{children}</div>;
}
