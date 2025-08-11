// (C) 2025 GoodData Corporation

import React from "react";

import { e } from "./treeviewBem.js";
import type { UiTreeViewAriaAttributes } from "./types.js";
import { makeItemId } from "./utils.js";

/**
 * @internal
 */
interface UiTreeviewRootProps {
    children?: React.ReactNode;
    path?: number[];
    handleKeyDown: (event: React.KeyboardEvent) => void;
    ariaAttributes: UiTreeViewAriaAttributes;
}

/**
 * @internal
 */
export function UiTreeviewRoot(props: UiTreeviewRootProps) {
    const { handleKeyDown, children, ariaAttributes, path } = props;
    return (
        <div
            {...ariaAttributes}
            className={e("root")}
            tabIndex={ariaAttributes.tabIndex ?? 0}
            onKeyDown={handleKeyDown}
            role="tree"
            aria-activedescendant={makeItemId(ariaAttributes.id, path)}
        >
            {children}
        </div>
    );
}
