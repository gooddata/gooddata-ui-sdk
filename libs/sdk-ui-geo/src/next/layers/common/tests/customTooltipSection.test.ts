// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ICustomTooltipConfig } from "@gooddata/sdk-ui-vis-commons";

import { type ITooltipReferenceMaps } from "../../registry/adapterTypes.js";
import { buildCustomTooltipPieces, composeTooltipBody } from "../customTooltipSection.js";

const FALLBACK = "(No data)";
const STRINGS = { noFetch: FALLBACK, noData: "(No data)", multipleItems: "(Multiple items)" };

const enabledAbove: ICustomTooltipConfig = {
    enabled: true,
    content: "**hello**",
    placement: "above",
};

const enabledBelow: ICustomTooltipConfig = { ...enabledAbove, placement: "below" };
const enabledReplace: ICustomTooltipConfig = { ...enabledAbove, placement: "replace" };

const emptyMaps: ITooltipReferenceMaps = { measures: {}, attributes: {} };

describe("buildCustomTooltipPieces", () => {
    it("returns empty pieces when config is undefined", () => {
        expect(buildCustomTooltipPieces({}, undefined, emptyMaps, undefined, STRINGS)).toEqual({
            sectionHtml: "",
            separatorHtml: "",
        });
    });

    it("returns empty pieces when config is disabled", () => {
        const cfg: ICustomTooltipConfig = { enabled: false, content: "x" };
        expect(buildCustomTooltipPieces({}, cfg, emptyMaps, undefined, STRINGS)).toEqual({
            sectionHtml: "",
            separatorHtml: "",
        });
    });

    it("returns empty pieces when content is missing", () => {
        const cfg: ICustomTooltipConfig = { enabled: true };
        expect(buildCustomTooltipPieces({}, cfg, emptyMaps, undefined, STRINGS)).toEqual({
            sectionHtml: "",
            separatorHtml: "",
        });
    });

    it("wraps rendered HTML in the custom-section div for above placement", () => {
        const result = buildCustomTooltipPieces({}, enabledAbove, emptyMaps, undefined, STRINGS);
        expect(result.sectionHtml).toContain('<div class="gd-viz-tooltip-custom-section">');
        expect(result.sectionHtml).toContain("<strong>hello</strong>");
        expect(result.separatorHtml).toBe('<div class="gd-viz-tooltip-custom-separator"></div>');
    });

    it("emits a separator for below placement", () => {
        const result = buildCustomTooltipPieces({}, enabledBelow, emptyMaps, undefined, STRINGS);
        expect(result.separatorHtml).toBe('<div class="gd-viz-tooltip-custom-separator"></div>');
    });

    it("suppresses the separator for replace placement", () => {
        const result = buildCustomTooltipPieces({}, enabledReplace, emptyMaps, undefined, STRINGS);
        expect(result.sectionHtml).not.toBe("");
        expect(result.separatorHtml).toBe("");
    });

    it("substitutes references that resolve, and uses fallbackText for unknown refs", () => {
        const cfg: ICustomTooltipConfig = {
            enabled: true,
            content: "value: {metric/sales}, missing: {metric/missing}",
        };
        const props: GeoJSON.GeoJsonProperties = {
            color: JSON.stringify({ title: "Sales", value: 42, localId: "m1" }),
        };
        const maps: ITooltipReferenceMaps = {
            measures: { m1: "sales" },
            attributes: {},
        };
        const result = buildCustomTooltipPieces(props, cfg, maps, undefined, STRINGS);
        expect(result.sectionHtml).toContain("value: 42");
        expect(result.sectionHtml).toContain(`missing: ${FALLBACK}`);
    });

    it("renders a broken image instead of leaking markdown when an image URL reference has no data", () => {
        const cfg: ICustomTooltipConfig = {
            enabled: true,
            content: "![Reykjavik]({label/flag_url})",
        };
        // No attribute provides `flag_url`, so the reference is absent → blanked in
        // the image src, yielding a broken image rather than `![Reykjavik](...)`.
        const result = buildCustomTooltipPieces({}, cfg, emptyMaps, undefined, STRINGS);
        expect(result.sectionHtml).toContain('<img src="" alt="Reykjavik"');
        expect(result.sectionHtml).not.toContain("![Reykjavik]");
    });
});

describe("composeTooltipBody", () => {
    const pieces = {
        sectionHtml: "<section/>",
        separatorHtml: "<sep/>",
    };
    const empty = { sectionHtml: "", separatorHtml: "" };

    it("returns defaultItemsHtml when no custom section is present", () => {
        expect(composeTooltipBody("<items/>", empty, "above")).toBe("<items/>");
    });

    it("places the custom section above by default when placement is undefined", () => {
        expect(composeTooltipBody("<items/>", pieces, undefined)).toBe("<section/><sep/><items/>");
    });

    it("places the custom section below for placement=below", () => {
        expect(composeTooltipBody("<items/>", pieces, "below")).toBe("<items/><sep/><section/>");
    });

    it("renders only the custom section for placement=replace", () => {
        expect(composeTooltipBody("<items/>", pieces, "replace")).toBe("<section/>");
    });

    it("suppresses the separator (above) when defaultItemsHtml is empty", () => {
        expect(composeTooltipBody("", pieces, "above")).toBe("<section/>");
    });

    it("suppresses the separator (below) when defaultItemsHtml is empty", () => {
        expect(composeTooltipBody("", pieces, "below")).toBe("<section/>");
    });
});
