// (C) 2025 GoodData Corporation

import React from "react";

export const WithConditionalAnchor = ({ href, children }: { href?: string; children: React.ReactNode }) => {
    return href ? <a href={href}>{children}</a> : children;
};
