// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

/**
 * @beta
 */
export interface LandingTitleProps {
    children: ReactNode;
}

/**
 * @beta
 */
export function DefaultLandingTitle({ children }: LandingTitleProps) {
    return <h3 className="gd-typography gd-typography--h1">{children}</h3>;
}

/**
 * @beta
 */
export function DefaultLandingTitleAscent({ children }: LandingTitleProps) {
    return <span className="gd-gen-ai-chat__messages__empty__h1--accent">{children}</span>;
}
