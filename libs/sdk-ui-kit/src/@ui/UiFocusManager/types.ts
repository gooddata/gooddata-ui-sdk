// (C) 2025 GoodData Corporation

import { type KeyboardEvent, type Ref } from "react";

/**
 * @internal
 */
export interface IUiFocusHelperConnectors<T extends HTMLElement = HTMLElement> {
    ref?: Ref<T>;
    onKeyDown?: (e: KeyboardEvent) => void;
}
