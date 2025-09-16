// (C) 2025 GoodData Corporation

import type { ComponentProps } from "react";

import { testIds } from "../automation/index.js";

export function Layout({ children, ...htmlProps }: ComponentProps<"div">) {
    return (
        <div data-testid={testIds.catalog} {...htmlProps} className="gd-analytics-catalog">
            {children}
        </div>
    );
}
