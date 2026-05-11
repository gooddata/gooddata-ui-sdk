// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { UiLink } from "../../UiLink/UiLink.js";

import { stopPropagationCallback } from "./utils.js";

export function WithConditionalAnchor({ href, children }: { href?: string; children: ReactNode }) {
    return href ? (
        <UiLink
            variant="secondary"
            fullWidth
            href={href}
            onClick={(e) => {
                stopPropagationCallback(e);
            }}
            tabIndex={-1}
        >
            {children}
        </UiLink>
    ) : (
        children
    );
}
