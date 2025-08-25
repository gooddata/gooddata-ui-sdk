// (C) 2025 GoodData Corporation

import React from "react";

import { IUiAsyncTableIconRendererProps } from "../types.js";

export function UiAsyncTableIconRenderer<T>({
    renderIcon,
    className,
    item,
}: IUiAsyncTableIconRendererProps<T>): React.ReactElement | null {
    const content = renderIcon?.(item);
    return content && <div className={className}>{content}</div>;
}
