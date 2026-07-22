// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { type IUiListboxStaticItemProps } from "../types.js";

/**
 * By default just renders the data.
 * @internal
 */
export function DefaultUiListboxStaticItemComponent<T>({ item }: IUiListboxStaticItemProps<T>): ReactNode {
    return item.data as ReactNode;
}
