// (C) 2026 GoodData Corporation

import { onTestFinished } from "vitest";

const realRemoveChild = Node.prototype.removeChild;
const realRemove = Element.prototype.remove;

/**
 * Makes the DOM blur a focused element when its subtree is removed, as Chrome does: focusout fires
 * with no relatedTarget. happy-dom drops the focus silently instead, which hides anything that
 * listens for focus leaving. Restored when the calling test finishes.
 */
export function blurOnRemoval(): void {
    const blurIfInside = (node: Node) => {
        const active = document.activeElement;
        if (active instanceof HTMLElement && node.contains(active)) {
            active.blur();
        }
    };

    Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
        blurIfInside(child);
        realRemoveChild.call(this, child);
        return child;
    };
    Element.prototype.remove = function (this: Element) {
        blurIfInside(this);
        realRemove.call(this);
    };

    onTestFinished(() => {
        Node.prototype.removeChild = realRemoveChild;
        Element.prototype.remove = realRemove;
    });
}
