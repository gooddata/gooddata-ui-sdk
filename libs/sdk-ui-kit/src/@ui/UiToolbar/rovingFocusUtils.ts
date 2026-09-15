// (C) 2026 GoodData Corporation

import { focusableElementsSelector } from "../../utils/domUtilities.js";

/**
 * Marks an element that holds several focusable children but counts as one toolbar stop (a radiogroup).
 */
export const TOOLBAR_COMPOSITE_ATTR = "data-gd-toolbar-composite";

/**
 * Marks a subtree the toolbar keyboard navigation must ignore. Set it as a data attribute on a
 * wrapper element inside a {@link UiToolbar}.
 *
 * @internal
 */
export const TOOLBAR_SKIP_ATTR = "data-gd-toolbar-skip";

/**
 * Set on every element whose tabindex the toolbar wrote, so the write can be undone when the element
 * leaves the managed set.
 */
export const TOOLBAR_MANAGED_ATTR = "data-gd-toolbar-managed";

/**
 * Marks the root of a {@link UiToolbar}; composites use it to tell a managing toolbar from any other
 * `role="toolbar"` element.
 */
export const TOOLBAR_ROOT_ATTR = "data-gd-toolbar";

export interface IRovingFocusOptions {
    isDisabledFocusable: boolean;
}

function matchesDisabled(element: HTMLElement): boolean {
    try {
        return element.matches(":disabled");
    } catch {
        return false;
    }
}

// A disabled fieldset disables its descendants too, except those in its first legend.
function isNativelyDisabled(element: HTMLElement): boolean {
    if (
        ("disabled" in element && (element as HTMLButtonElement).disabled === true) ||
        matchesDisabled(element)
    ) {
        return true;
    }
    const fieldset = element.closest<HTMLFieldSetElement>("fieldset[disabled]");
    if (fieldset === null) {
        return false;
    }
    const legend = fieldset.querySelector(":scope > legend");
    return legend === null || !legend.contains(element);
}

function isHiddenByStyle(element: HTMLElement): boolean {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    return style !== undefined && (style.display === "none" || style.visibility === "hidden");
}

/**
 * Hidden by an attribute or by CSS, on the element or on any ancestor below the container.
 */
function isHidden(container: HTMLElement, element: HTMLElement): boolean {
    const hidden = element.closest<HTMLElement>('[hidden], [aria-hidden="true"]');
    if (hidden !== null && hidden !== container && container.contains(hidden)) {
        return true;
    }
    for (
        let node: HTMLElement | null = element;
        node !== null && node !== container;
        node = node.parentElement
    ) {
        if (isHiddenByStyle(node)) {
            return true;
        }
    }
    return false;
}

/**
 * True while the element is still one of the container's eligible focus targets.
 */
export function isEligibleFocusable(
    container: HTMLElement,
    element: HTMLElement,
    options: IRovingFocusOptions,
): boolean {
    return element.isConnected && isFocusable(container, element) && isEligible(element, options);
}

/**
 * True when the element sits in a subtree marked with {@link TOOLBAR_SKIP_ATTR} below the container.
 */
export function isSkipped(container: HTMLElement, element: HTMLElement): boolean {
    const skipped = element.closest(`[${TOOLBAR_SKIP_ATTR}]`);
    return skipped !== null && skipped !== container && container.contains(skipped);
}

function isFocusable(container: HTMLElement, element: HTMLElement): boolean {
    return (
        element.matches(focusableElementsSelector) &&
        !isNativelyDisabled(element) &&
        element.getAttribute("role") !== "separator" &&
        !isHidden(container, element) &&
        !isSkipped(container, element)
    );
}

export function isEligible(element: HTMLElement, options: IRovingFocusOptions): boolean {
    return options.isDisabledFocusable || element.getAttribute("aria-disabled") !== "true";
}

function getCompositeOf(container: HTMLElement, element: HTMLElement): HTMLElement | null {
    const composite = element.parentElement?.closest<HTMLElement>(`[${TOOLBAR_COMPOSITE_ATTR}]`) ?? null;
    return composite !== null && composite !== container && container.contains(composite) ? composite : null;
}

export function getFocusableDescendants(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(focusableElementsSelector)).filter((element) =>
        isFocusable(container, element),
    );
}

function getEligibleWithin(composite: HTMLElement, options: IRovingFocusOptions): HTMLElement[] {
    return getFocusableDescendants(composite).filter((element) => isEligible(element, options));
}

export function getToolbarStops(container: HTMLElement, options: IRovingFocusOptions): HTMLElement[] {
    const candidates = container.querySelectorAll<HTMLElement>(
        `${focusableElementsSelector}, [${TOOLBAR_COMPOSITE_ATTR}]`,
    );

    return Array.from(candidates).filter((element) => {
        if (element.hasAttribute(TOOLBAR_COMPOSITE_ATTR)) {
            return (
                !isHidden(container, element) &&
                !isSkipped(container, element) &&
                getEligibleWithin(element, options).length > 0
            );
        }

        return (
            getCompositeOf(container, element) === null &&
            isFocusable(container, element) &&
            isEligible(element, options)
        );
    });
}

export function resolveStop(container: HTMLElement, element: Element | null): HTMLElement | null {
    if (!(element instanceof HTMLElement) || !container.contains(element)) {
        return null;
    }

    return getCompositeOf(container, element) ?? element;
}

export function getStopFocusTarget(
    stop: HTMLElement,
    remembered: HTMLElement | null,
    options: IRovingFocusOptions,
): HTMLElement | null {
    if (!stop.hasAttribute(TOOLBAR_COMPOSITE_ATTR)) {
        return stop;
    }

    const within = getEligibleWithin(stop, options);

    if (remembered && within.includes(remembered)) {
        return remembered;
    }

    return within.find((element) => element.getAttribute("aria-checked") === "true") ?? within[0] ?? null;
}

/**
 * Makes exactly one focusable descendant reachable with Tab and returns it.
 */
export function applyRovingTabIndex(
    container: HTMLElement,
    remembered: HTMLElement | null,
    options: IRovingFocusOptions,
): HTMLElement | null {
    const stops = getToolbarStops(container, options);

    let stop = remembered ? resolveStop(container, remembered) : null;
    if (stop === null || !stops.includes(stop)) {
        stop = stops[0] ?? null;
    }

    const target = stop === null ? null : (getStopFocusTarget(stop, remembered, options) ?? stops[0]);

    // Hidden and disabled descendants are reset too, so a stop that became hidden or disabled cannot
    // keep tabindex 0. An element that moved into a skipped subtree gets the toolbar's write undone.
    for (const element of container.querySelectorAll<HTMLElement>(focusableElementsSelector)) {
        if (isSkipped(container, element)) {
            if (element.hasAttribute(TOOLBAR_MANAGED_ATTR)) {
                element.removeAttribute("tabindex");
                element.removeAttribute(TOOLBAR_MANAGED_ATTR);
            }
            continue;
        }
        element.tabIndex = element === target ? 0 : -1;
        element.setAttribute(TOOLBAR_MANAGED_ATTR, "");
    }

    return target;
}

const NON_EDITING_INPUT_TYPES = new Set(["button", "checkbox", "radio", "submit", "reset", "image", "file"]);

/**
 * The logical offset a horizontal arrow leaves the text at. In an RTL field offset 0 sits at the
 * visual right edge, so the two arrows swap.
 *
 * An explicit `dir` attribute wins over the computed style: it is what a consumer sets to mark a
 * right-to-left value, and test environments do not resolve it into `direction`.
 */
function isStartEdgeKey(target: HTMLElement, direction: "ArrowLeft" | "ArrowRight"): boolean {
    const declared = target.closest("[dir]")?.getAttribute("dir")?.toLowerCase();
    const isRtl =
        declared === "rtl" ||
        (declared !== "ltr" &&
            target.ownerDocument.defaultView?.getComputedStyle(target).direction === "rtl");
    return isRtl ? direction === "ArrowRight" : direction === "ArrowLeft";
}

function isContentEditableCaretAtEdge(target: HTMLElement, direction: "ArrowLeft" | "ArrowRight"): boolean {
    const selection = target.ownerDocument.getSelection();
    if (!selection || !selection.isCollapsed || selection.rangeCount === 0) {
        return false;
    }
    const caret = selection.getRangeAt(0);
    if (!target.contains(caret.startContainer)) {
        return false;
    }
    const before = target.ownerDocument.createRange();
    before.selectNodeContents(target);
    before.setEnd(caret.startContainer, caret.startOffset);
    const offset = before.toString().length;
    return isStartEdgeKey(target, direction) ? offset === 0 : offset === (target.textContent ?? "").length;
}

/**
 * True when a horizontal arrow key in an editing target would move the caret past its edge, so the
 * key can be handed to the toolbar instead.
 */
const SELECTION_INPUT_TYPES = new Set(["text", "search", "url", "tel", "password"]);

export function isCaretAtEdge(target: EventTarget | null, direction: "ArrowLeft" | "ArrowRight"): boolean {
    // Other input types have no caret selection; reading it returns null or throws.
    if (target instanceof HTMLInputElement && !SELECTION_INPUT_TYPES.has(target.type)) {
        return false;
    }
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const { selectionStart, selectionEnd, value } = target;
        if (selectionStart === null || selectionEnd === null || selectionStart !== selectionEnd) {
            return false;
        }
        return isStartEdgeKey(target, direction) ? selectionStart === 0 : selectionEnd === value.length;
    }
    if (target instanceof HTMLElement && target.isContentEditable) {
        return isContentEditableCaretAtEdge(target, direction);
    }
    return false;
}

/**
 * True for elements that use arrow, Home and End keys to move a caret or a value.
 */
export function isEditingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    if (target.isContentEditable || target instanceof HTMLTextAreaElement) {
        return true;
    }
    return target instanceof HTMLInputElement && !NON_EDITING_INPUT_TYPES.has(target.type);
}

/**
 * True when Alt, Ctrl or Meta is held. Those arrow combinations belong to the browser or the OS.
 */
export function hasSystemModifier(event: { altKey: boolean; ctrlKey: boolean; metaKey: boolean }): boolean {
    return event.altKey || event.ctrlKey || event.metaKey;
}
