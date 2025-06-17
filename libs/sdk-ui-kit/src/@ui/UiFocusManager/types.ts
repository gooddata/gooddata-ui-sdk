// (C) 2025 GoodData Corporation

import React from "react";

/**
 * @internal
 */
export interface IUiFocusHelperConnectors<T extends HTMLElement = HTMLElement> {
    ref?: React.Ref<T>;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * @internal
 */
export type NavigationDirection = "forward" | "backward";
