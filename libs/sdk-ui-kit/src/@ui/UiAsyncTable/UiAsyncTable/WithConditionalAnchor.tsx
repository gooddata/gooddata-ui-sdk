// (C) 2025 GoodData Corporation

import React from "react";
import { e } from "../asyncTableBem.js";

export const WithConditionalAnchor = ({ href, children }: { href?: string; children: React.ReactNode }) => {
    return href ? (
        <a className={e("link")} href={href}>
            {children}
        </a>
    ) : (
        children
    );
};
