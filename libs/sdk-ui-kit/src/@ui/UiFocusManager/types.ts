// (C) 2025 GoodData Corporation

import { KeyboardEvent, Ref } from "react";

/**
 * @internal
 */
export interface IUiFocusHelperConnectors<T extends HTMLElement = HTMLElement> {
    ref?: Ref<T>;
    onKeyDown?: (e: KeyboardEvent) => void;
}

/**
 * @internal
 */
export type NavigationDirection = "forward" | "backward";
