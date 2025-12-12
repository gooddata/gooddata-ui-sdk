// (C) 2022-2025 GoodData Corporation

import { type ReactNode } from "react";

/**
 * @internal
 */
export function TitleWrapper({ children }: { children?: ReactNode }) {
    return <div className="dash-title-wrapper">{children}</div>;
}
