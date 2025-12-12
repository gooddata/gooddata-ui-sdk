// (C) 2022-2025 GoodData Corporation

import { type ReactNode } from "react";

/**
 * @internal
 */
export function Footer({ children }: { children?: ReactNode }) {
    return <div className="gd-flex-dialog-footer">{children}</div>;
}
