// (C) 2025 GoodData Corporation

import React from "react";

import { testIds } from "../automation/index.js";

export function Layout({ children, ...htmlProps }: React.ComponentProps<"div">) {
    return (
        <div data-testid={testIds.catalog} {...htmlProps} className="gd-analytics-catalog">
            {children}
        </div>
    );
}
