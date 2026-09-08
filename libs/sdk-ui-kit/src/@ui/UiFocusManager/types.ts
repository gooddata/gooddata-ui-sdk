// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type Ref } from "react";

/**
 * @internal
 */
export interface IUiFocusHelperConnectors<T extends HTMLElement = HTMLElement> {
    ref?: Ref<T>;
    element?: T | null;
    onKeyDown?: (e: KeyboardEvent) => void;
}
