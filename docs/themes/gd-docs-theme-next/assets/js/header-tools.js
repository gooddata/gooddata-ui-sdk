// (C) 2026 GoodData Corporation

import { initDisclosure } from "./disclosure.js";

// Mobile/tablet overflow menu for header utilities (search, version, ask-AI,
// GitHub, theme-toggle). Same markup renders inline on lg; below lg it is a
// dropdown toggled by the kebab button. No-op once viewport is lg (panel is
// lg:flex regardless of the hidden/flex class we toggle here).
export function initHeaderTools() {
    initDisclosure(document.getElementById("header-tools-toggle"), document.getElementById("header-tools"), {
        open: ["flex"],
        closed: ["hidden"],
    });
}
