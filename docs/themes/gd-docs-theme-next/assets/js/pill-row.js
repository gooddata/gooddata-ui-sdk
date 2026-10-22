// (C) 2026 GoodData Corporation

// The link chips above a page's H1 (a guide's API symbols, a reference page's
// "Guide:" links) can run to a dozen or more and push the title off screen.
// Show the first few and let the reader open the rest.
//
// The toggle is rendered by api-reference-panel.html / page-shell.html only when
// a row has more chips than fit, and ships `hidden`, so a page with no JS simply
// shows every chip. Visibility is an inline style, same as props-table.js:
// Tailwind only compiles classes it finds in rendered HTML.
const VISIBLE_PILLS = 3;

export function initPillRows() {
    document.querySelectorAll("[data-pill-row]").forEach((row) => {
        const button = row.querySelector("[data-pill-toggle]");
        const pills = [...row.querySelectorAll("[data-pill]")];
        if (!button || pills.length <= VISIBLE_PILLS) return;

        const overflow = pills.slice(VISIBLE_PILLS);

        const setExpanded = (expanded) => {
            overflow.forEach((pill) => {
                pill.style.display = expanded ? "" : "none";
            });
            button.setAttribute("aria-expanded", String(expanded));
            button.textContent = expanded ? "Show less" : `+${overflow.length} more`;
        };

        setExpanded(false);
        button.hidden = false;

        button.addEventListener("click", () => {
            const expanded = button.getAttribute("aria-expanded") === "true";
            setExpanded(!expanded);
            // Opening moves focus to the first revealed chip so keyboard users land on new content.
            if (!expanded) overflow[0].focus();
        });
    });
}
