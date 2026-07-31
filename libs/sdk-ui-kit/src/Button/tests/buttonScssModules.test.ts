// (C) 2026 GoodData Corporation

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as sass from "sass";
import { describe, expect, it } from "vitest";

const SCSS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../../styles/scss");

/**
 * Mirrors how other SDK packages consume the button mixins — sdk-ui-charts/styles/scss/repeater.scss,
 * sdk-ui-pivot/styles/scss/pivotTable.scss and the sdk-ui-filters stylesheets all `@use` Button/mixins
 * just for the active-gradient mixin.
 */
const CONSUMER_SCSS = `
@use "Button/mixins" as button-mixins;

.gd-fixture-gradient-consumer {
    @include button-mixins.button-normal-active-gradient;
}
`;

const CONSUMER_URL = "consumer-fixture";

const consumerImporter: sass.Importer<"sync"> = {
    canonicalize: (url) => (url === CONSUMER_URL ? new URL(`file:///${CONSUMER_URL}.scss`) : null),
    load: () => ({ contents: CONSUMER_SCSS, syntax: "scss" }),
};

/**
 * Mirrors an app entry point that pulls several SDK stylesheets in through legacy `@import` —
 * libs/gdc-ldm-modeler-runtime/src/styles/app.scss does exactly this for ~20 SDK packages.
 */
const ENTRY_SCSS = `
@import "button";
@import "${CONSUMER_URL}";
`;

const BASE_BORDER = "border: 1px solid transparent";
const VARIANT_BORDER = "border-color: var(--gd-palette-complementary-4";

interface IRule {
    selector: string;
    body: string;
    at: number;
}

/**
 * Splits compiled CSS into its outermost rules, keeping each one's offset for cascade comparisons.
 * An at-rule (`@media`, `@supports`) counts as one rule and its nested rules are not visited — the
 * button rules are all top-level today, and if that ever changes the assertions below fail loudly on
 * an empty match rather than passing vacuously.
 */
const outerRules = (css: string): IRule[] => {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const rules: IRule[] = [];
    let cursor = 0;

    for (let open = withoutComments.indexOf("{"); open >= 0; open = withoutComments.indexOf("{", cursor)) {
        let depth = 1;
        let end = open + 1;
        while (end < withoutComments.length && depth > 0) {
            if (withoutComments[end] === "{") {
                depth += 1;
            } else if (withoutComments[end] === "}") {
                depth -= 1;
            }
            end += 1;
        }
        rules.push({
            selector: withoutComments.slice(cursor, open).trim(),
            body: withoutComments.slice(open + 1, end - 1),
            at: open,
        });
        cursor = end;
    }

    return rules;
};

const secondaryButtonRules = () => {
    const css = sass.compileString(ENTRY_SCSS, {
        loadPaths: [SCSS_DIR, resolve(SCSS_DIR, "../../node_modules")],
        importers: [consumerImporter],
    }).css;

    return outerRules(css).filter((rule) => rule.selector.includes(".gd-button-secondary"));
};

// Each `@import` gets its own import context, and every module `@use`d below it is re-evaluated
// there — so a placeholder that button.scss `@extend`s is emitted once per import context. When
// Button/mixins still carried %btn, importing any package that uses the gradient mixin appended a
// late copy of the base rule, and its `border: 1px solid transparent` reset `.gd-button-secondary`'s
// border-color at equal specificity: the Modeler's secondary buttons lost their border (LX-2773).
// Shared button rules belong in Button/_placeholders.scss, which only button.scss loads.
describe("button.scss cascade under legacy @import", () => {
    it("should emit the %btn base rule for .gd-button-secondary exactly once", () => {
        const bases = secondaryButtonRules().filter((rule) => rule.body.includes(BASE_BORDER));

        expect(bases).toHaveLength(1);
    });

    it("should keep the %btn base rule ahead of the .gd-button-secondary border-color", () => {
        const rules = secondaryButtonRules();
        const bases = rules.filter((rule) => rule.body.includes(BASE_BORDER));
        // Only the pseudo-class-free variant rule ties with the base rule on specificity, so it is the
        // one document order decides. The `:hover` variant outranks the base wherever it sits and would
        // make this assertion pass even with a stray base copy right after the plain rule.
        const variants = rules.filter(
            (rule) => rule.body.includes(VARIANT_BORDER) && !rule.selector.includes(":"),
        );

        expect(bases.length).toBeGreaterThan(0);
        expect(variants.length).toBeGreaterThan(0);

        const lastBase = Math.max(...bases.map((rule) => rule.at));
        const firstVariant = Math.min(...variants.map((rule) => rule.at));

        expect(lastBase).toBeLessThan(firstVariant);
    });
});
