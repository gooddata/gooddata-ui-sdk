// (C) 2025 GoodData Corporation

import { ReactElement } from "react";

import { IUiAsyncTableIconRendererProps } from "../types.js";

export function UiAsyncTableIconRenderer<T>({
    renderIcon,
    className,
    item,
}: IUiAsyncTableIconRendererProps<T>): ReactElement | null {
    const content = renderIcon?.(item);
    return content && <div className={className}>{content}</div>;
}
