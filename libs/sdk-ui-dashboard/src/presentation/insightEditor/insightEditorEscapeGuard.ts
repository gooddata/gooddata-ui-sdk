// (C) 2026 GoodData Corporation

const OVERLAY_CONTENT_SELECTOR = ".gd-overlay-content";
const INSIGHT_OVERLAY_CONTENT_SELECTOR = ".s-edit-insight-overlay-content";

/**
 * Tells whether the insight overlay is the TOPMOST open ui-kit overlay in the document.
 *
 * With AD running in-process, its nested UI (filter dropdowns, save dialogs, tooltips) portals
 * into the same document as this overlay. Every ui-kit Overlay with closeOnEscape listens on
 * window with no stack awareness, so a single Escape aimed at a nested AD dropdown would also
 * cancel the whole editing session (the iframe transport used to shield this — AD key events
 * never left the iframe document). That is why the insight overlay handles Escape itself, gated
 * by this check.
 *
 * Overlay portals append to document.body in mount order, so the last .gd-overlay-content node is
 * the topmost overlay; the insight overlay may only close itself when that node is its own.
 * Nested overlays unmount asynchronously (React re-render), so during the very Escape press that
 * closes a nested overlay this still sees its node and correctly skips — Escape peels one layer
 * per press.
 */
export function isInsightOverlayTopmost(doc: Document = document): boolean {
    const contents = doc.querySelectorAll(OVERLAY_CONTENT_SELECTOR);
    const topmost = contents[contents.length - 1];
    return !!topmost?.querySelector(INSIGHT_OVERLAY_CONTENT_SELECTOR);
}
