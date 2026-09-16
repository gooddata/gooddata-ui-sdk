// (C) 2007-2026 GoodData Corporation

/**
 * Checks whether a keyboard/DOM event target is an element the user can type or edit into
 * (an <input>, a <textarea>, or a contentEditable element) — such targets should be excluded
 * from global keyboard shortcut handling so native text-editing behavior isn't hijacked.
 *
 * @internal
 */
export function isEditableElement(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
    );
}
