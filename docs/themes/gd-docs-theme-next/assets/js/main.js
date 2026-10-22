// (C) 2026 GoodData Corporation

import { initCodeEnhance } from "./code-enhance.js";
import { initContentFixup } from "./content-fixup.js";
import { initDisclosure } from "./disclosure.js";
import { initFooterAccordion } from "./footer-accordion.js";
import { initHeaderTools } from "./header-tools.js";
import { initHeadingAnchors } from "./heading-anchors.js";
import { initPillRows } from "./pill-row.js";
import { initPropsTable } from "./props-table.js";
import { initSidebar } from "./sidebar.js";
import { initThemeToggle } from "./theme-toggle.js";
import { initTocScrollspy } from "./toc-scrollspy.js";
import { initVersionMenu } from "./version-menu.js";

const boot = () => {
    initThemeToggle();
    initSidebar();
    initTocScrollspy();
    initCodeEnhance();
    initHeadingAnchors();
    initContentFixup();
    initVersionMenu();
    initHeaderTools();
    initDisclosure(
        document.getElementById("gd-header-menu-toggle"),
        document.getElementById("gd-header-menu"),
        {
            open: ["is-open"],
        },
    );
    initPillRows();
    initPropsTable();
    initFooterAccordion();
};
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
