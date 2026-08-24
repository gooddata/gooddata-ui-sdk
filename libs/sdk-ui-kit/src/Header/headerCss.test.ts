// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createHeaderCssRules } from "./headerCss.js";

const GUID = "header-1234";

describe("createHeaderCssRules", () => {
    it("should qualify the root rule with .gd-header so it outranks the static header.scss rule", () => {
        const css = createHeaderCssRules(GUID, "#FF69B4", "#ffe5ea", "#FF66CC");

        // A bare `.<guid>` selector ties with `.gd-header { color: #fff; background: #000 }` from
        // header.scss on the very same element, so a stylesheet injected into <head> later (which
        // happens whenever the host lazy-loads a module-federated app that re-ships header.scss)
        // would win on document order and revert the themed header to black/white.
        const rootRule = css.split("\n")[0];
        expect(rootRule).toBe(`.gd-header.${GUID} { color: #ffe5ea; background: #FF69B4}`);
    });

    it("should keep the descendant rules scoped by the guid alone", () => {
        const css = createHeaderCssRules(GUID, "#FF69B4", "#ffe5ea", "#FF66CC");

        expect(css).toContain(
            `.${GUID} .gd-header-menu-item.active { border-color: var(--gd-palette-primary-base-from-theme, #FF66CC)}`,
        );
        expect(css).toContain(`.${GUID} .gd-header-menu-section { border-color:`);
        expect(css).toContain(`.${GUID} .hamburger-icon:not(.is-open) i { border-color: #ffe5ea}`);
    });

    it("should derive a readable text color when only the background is branded", () => {
        const css = createHeaderCssRules(GUID, "#ffffff");

        expect(css.split("\n")[0]).toBe(`.gd-header.${GUID} { color: #000; background: #ffffff}`);
    });
});
