// (C) 2025 GoodData Corporation

import { type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import { b } from "./treeviewBem.js";
import type { UiTreeViewAriaAttributes } from "./types.js";
import { makeItemId } from "./utils.js";

/**
 * @internal
 */
interface UiTreeviewRootProps {
    children?: ReactNode;
    path: number[];
    handleKeyDown: (event: KeyboardEvent) => void;
    ariaAttributes: UiTreeViewAriaAttributes;
    style?: CSSProperties;
    dataTestId?: string;
}

/**
 * @internal
 */
export function UiTreeviewRoot({
    handleKeyDown,
    children,
    ariaAttributes,
    path,
    style,
    dataTestId,
}: UiTreeviewRootProps) {
    const activeDescendant = path.length > 0 ? makeItemId(ariaAttributes.id, path) : undefined;
    return (
        <div
            {...ariaAttributes}
            className={b()}
            style={style}
            data-testid={dataTestId}
            tabIndex={ariaAttributes.tabIndex ?? 0}
            onKeyDown={handleKeyDown}
            role="tree"
            aria-activedescendant={activeDescendant}
        >
            {children}
        </div>
    );
}
