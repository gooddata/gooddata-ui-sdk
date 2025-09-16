// (C) 2025 GoodData Corporation

import React from "react";

import { stopPropagationCallback } from "./utils.js";
import { UiLink } from "../../UiLink/UiLink.js";

export function WithConditionalAnchor({ href, children }: { href?: string; children: React.ReactNode }) {
    return href ? (
        <UiLink
            variant="secondary"
            fullWidth
            href={href}
            onClick={(e) => {
                stopPropagationCallback(e);
            }}
        >
            {children}
        </UiLink>
    ) : (
        children
    );
}
