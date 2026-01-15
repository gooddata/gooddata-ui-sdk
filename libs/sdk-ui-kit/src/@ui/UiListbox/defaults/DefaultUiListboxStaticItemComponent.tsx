// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import { Separator } from "../../../List/index.js";
import { type IUiListboxStaticItemProps } from "../types.js";

/**
 * @internal
 */
export const separatorStaticItem = {
    data: <Separator />,
    type: "static" as const,
};

/**
 * @internal
 */
export function isSeparator(item: unknown): item is typeof separatorStaticItem {
    return item === separatorStaticItem;
}

/**
 * By default just renders the data.
 * @internal
 */
export function DefaultUiListboxStaticItemComponent<T>({ item }: IUiListboxStaticItemProps<T>): ReactNode {
    return item.data as ReactNode;
}
