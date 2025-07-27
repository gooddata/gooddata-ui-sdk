// (C) 2022-2025 GoodData Corporation
import { ReactNode } from "react";

/**
 * @internal
 */
export function Header({ children }: { children?: ReactNode }) {
    return <div className="gd-widget-header">{children}</div>;
}
