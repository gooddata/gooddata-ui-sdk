// (C) 2026 GoodData Corporation

const CHAT_WINDOW_SELECTOR = ".gd-gen-ai-chat__window";

/**
 * Tells whether the chat window is visually covered by other UI (e.g. Dashboards' insight editing
 * overlay opened over the chat).
 *
 * The chat handles Escape itself on window level with no overlay stack awareness, and the covering
 * overlay may be rendered by a different application layer (host shell vs. dashboards remote), so
 * neither props nor a shared overlay controller can carry the "something is above you" signal
 * reliably. Hit-testing the chat window's center answers exactly the question that matters — what
 * would the user's click land on — regardless of who rendered the covering layer and how its
 * z-index came to be. When covered, Escape must be left to the covering layer; the chat may only
 * close itself when it is on top.
 */
export function isChatWindowCovered(doc: Document = document): boolean {
    const chatWindow = doc.querySelector(CHAT_WINDOW_SELECTOR);
    if (!chatWindow) {
        return false;
    }
    const rect = chatWindow.getBoundingClientRect();
    const hit = doc.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return !!hit && !chatWindow.contains(hit);
}
