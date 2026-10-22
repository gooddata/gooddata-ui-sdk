// Generated props tables run to 25+ rows, which buries the rest of a component
// page below a wall of API detail. Collapse them to the first few rows and let
// the reader open the whole thing.
//
// The button is rendered by layouts/_markup/render-table.html and ships `hidden`,
// so a table short enough not to need it — or a page with no JS — simply shows
// every row. Row visibility is set with an inline style rather than a class:
// Tailwind only compiles classes it finds in rendered HTML, and inline styles
// also beat the `display: block` that the mobile card layout puts on each row,
// so the same toggle works for the stacked cards and the desktop table.
const VISIBLE_ROWS = 8;

export function initPropsTable() {
  document.querySelectorAll(".props-table").forEach((wrapper) => {
    const button = wrapper.nextElementSibling;
    if (!button?.matches("[data-props-toggle]")) return;

    const rows = [...wrapper.querySelectorAll("tbody > tr")];
    if (rows.length <= VISIBLE_ROWS) return;

    const label = button.querySelector("[data-props-toggle-label]") || button;
    const overflow = rows.slice(VISIBLE_ROWS);
    // The same markup serves props, parameters, properties, fields and members;
    // the render hook names which one from the table's own headers.
    const noun = button.dataset.propsNoun || "rows";

    const setExpanded = (expanded) => {
      overflow.forEach((row) => {
        row.style.display = expanded ? "" : "none";
      });
      button.setAttribute("aria-expanded", String(expanded));
      label.textContent = expanded ? `Show first ${VISIBLE_ROWS} ${noun}` : `Show all ${rows.length} ${noun}`;
    };

    setExpanded(false);
    button.hidden = false;

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      setExpanded(!expanded);
      // Collapsing from far down the table would otherwise leave the reader
      // staring at whatever moved up into the viewport.
      if (expanded) button.scrollIntoView({ block: "nearest" });
    });
  });
}
