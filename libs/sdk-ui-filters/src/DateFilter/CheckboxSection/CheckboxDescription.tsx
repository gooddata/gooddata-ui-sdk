// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

/**
 * Always-present copy of a checkbox's hover tooltip (the bubble is only mounted while hovered),
 * so the checkbox has a stable description. aria-hidden keeps it from being read a second time
 * as plain text in browse mode; aria-describedby still uses it.
 *
 * @internal
 */
export function CheckboxDescription({ id, children }: { id: string; children: ReactNode }) {
    return (
        <span className="sr-only" id={id} aria-hidden="true">
            {children}
        </span>
    );
}
