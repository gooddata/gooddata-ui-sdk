// (C) 2025 GoodData Corporation

import React from "react";

import { UiLink } from "../../UiLink/UiLink.js";

export function WithConditionalAnchor({ href, children }: { href?: string; children: React.ReactNode }) {
    return href ? (
        <UiLink variant="secondary" href={href} fullWidth>
            {children}
        </UiLink>
    ) : (
        children
    );
}
