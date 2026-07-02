// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { partitionAttachments } from "../Attachments/attachmentFormats.js";

const DASHBOARD_ALL = ["PDF", "PDF_SLIDES", "PPTX", "XLSX"];
const DASHBOARD_SLIDES = ["PDF_SLIDES", "PPTX"];
// Widget "PDF" is the single-slide presentation export, so it is a slide format alongside PPTX.
const WIDGET_ALL = ["PNG", "PPTX", "PDF", "PDF_TABULAR", "XLSX", "CSV", "CSV_RAW"];
const WIDGET_SLIDES = ["PDF", "PPTX"];

describe("partitionAttachments", () => {
    it("offers every format and hides nothing when slide exports are enabled", () => {
        expect(partitionAttachments(DASHBOARD_ALL, DASHBOARD_SLIDES, ["PDF_SLIDES", "PDF"], true)).toEqual({
            available: DASHBOARD_ALL,
            visibleSelected: ["PDF_SLIDES", "PDF"],
            hiddenSelected: [],
        });
    });

    it("drops slide formats from the offered set when slide exports are disabled", () => {
        expect(partitionAttachments(DASHBOARD_ALL, DASHBOARD_SLIDES, [], false).available).toEqual([
            "PDF",
            "XLSX",
        ]);
    });

    it("splits a selection into visible and hidden when slide exports are disabled", () => {
        expect(partitionAttachments(DASHBOARD_ALL, DASHBOARD_SLIDES, ["PDF_SLIDES", "PDF"], false)).toEqual({
            available: ["PDF", "XLSX"],
            visibleSelected: ["PDF"],
            hiddenSelected: ["PDF_SLIDES"],
        });
    });

    it("treats the widget single-slide PDF as a hidden slide format when disabled", () => {
        expect(partitionAttachments(WIDGET_ALL, WIDGET_SLIDES, ["PPTX", "PDF", "PNG"], false)).toEqual({
            available: ["PNG", "PDF_TABULAR", "XLSX", "CSV", "CSV_RAW"],
            visibleSelected: ["PNG"],
            hiddenSelected: ["PPTX", "PDF"],
        });
    });
});
