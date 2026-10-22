// (C) 2026 GoodData Corporation

// Footer link columns below lg: each heading is a button with
// data-footer-toggle="<list id>". A click shows or hides the list and keeps
// aria-expanded honest; the chevron turns off that attribute in CSS.
//
// At lg every list is shown by `lg:block` whatever the button says, so with
// JS off desktop is unaffected and a phone shows the headings with the lists
// closed.
export function initFooterAccordion() {
    document.querySelectorAll("#gd-footer [data-footer-toggle]").forEach((btn) => {
        const target = document.getElementById(btn.getAttribute("data-footer-toggle"));
        if (!target) return;

        btn.addEventListener("click", () => {
            const open = btn.getAttribute("aria-expanded") !== "true";
            target.classList.toggle("hidden", !open);
            btn.setAttribute("aria-expanded", String(open));
        });
    });
}
