// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import { stopPropagationCallback } from "./utils.js";
import { UiLink } from "../../UiLink/UiLink.js";

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
