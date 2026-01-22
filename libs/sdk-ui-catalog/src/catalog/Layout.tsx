// (C) 2025-2026 GoodData Corporation

import type { ComponentProps } from "react";

import { catalog } from "../automation/testIds.js";

export function Layout({ children, ...htmlProps }: ComponentProps<"div">) {
    return (
        <div data-testid={catalog} {...htmlProps} className="gd-analytics-catalog">
            {children}
        </div>
    );
}
