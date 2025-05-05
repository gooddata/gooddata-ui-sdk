// (C) 2025 GoodData Corporation

import React from "react";
import { UiMenuStaticItemProps } from "../types.js";

/**
 * By default just renders the data.
 * @internal
 */
export function DefaultUiMenuStaticItemComponent<T>({ item }: UiMenuStaticItemProps<T>): React.ReactNode {
    return item.data as React.ReactNode;
}
