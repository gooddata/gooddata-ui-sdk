// (C) 2025 GoodData Corporation

import React from "react";
import { Separator } from "../../../List/index.js";
import { UiListboxStaticItemProps } from "../types.js";

/**
 * @internal
 */
export const separatorStaticItem = {
    data: <Separator />,
    type: "static" as const,
};

/**
 * By default just renders the data.
 * @internal
 */
export function DefaultUiListboxStaticItemComponent<T>({
    item,
}: UiListboxStaticItemProps<T>): React.ReactNode {
    return item.data as React.ReactNode;
}
