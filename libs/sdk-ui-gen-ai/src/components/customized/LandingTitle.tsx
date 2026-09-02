// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

/**
 * @alpha
 */
export interface ILandingTitleProps {
    children: ReactNode;
}

/**
 * Default implementation of the LandingTitle slot.
 *
 * @alpha
 */
export function DefaultLandingTitle({ children }: ILandingTitleProps) {
    return <h3 className="gd-typography gd-typography--h1">{children}</h3>;
}

/**
 * Default implementation of the LandingTitleAscent slot.
 *
 * @alpha
 */
export function DefaultLandingTitleAscent({ children }: ILandingTitleProps) {
    return <span className="gd-gen-ai-chat__messages__empty__h1--accent">{children}</span>;
}
