// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type DashboardAttachmentType, type WidgetAttachmentType } from "@gooddata/sdk-model";

import { partitionAttachments } from "../Attachments/attachmentFormats.js";

// Annotated so the generic is instantiated at the real unions — renaming a format in sdk-model
// must break these tests rather than silently widening `T` to `string`.
const DASHBOARD_ALL: DashboardAttachmentType[] = ["PDF", "PDF_SLIDES", "PPTX", "XLSX"];
const DASHBOARD_SLIDES: DashboardAttachmentType[] = ["PDF_SLIDES", "PPTX"];
// Widget "PDF" is the single-slide presentation export, so it is a slide format alongside PPTX.
// Mirrors ALL_WIDGET_ATTACHMENTS, which deliberately omits "HTML".
const WIDGET_ALL: WidgetAttachmentType[] = ["PNG", "PPTX", "PDF", "PDF_TABULAR", "XLSX", "CSV", "CSV_RAW"];
const WIDGET_SLIDES: WidgetAttachmentType[] = ["PDF", "PPTX"];

describe("partitionAttachments", () => {
    it("offers every format and hides nothing when nothing is excluded", () => {
        const { available, visibleSelected, buildNextSelection } = partitionAttachments({
            all: DASHBOARD_ALL,
            selected: ["PDF_SLIDES", "PDF"],
        });

        expect(available).toEqual(DASHBOARD_ALL);
        expect(visibleSelected).toEqual(["PDF_SLIDES", "PDF"]);
        expect(buildNextSelection(["XLSX"])).toEqual(["XLSX"]);
    });

    it("drops excluded slide formats from the offered set", () => {
        const { available } = partitionAttachments({
            all: DASHBOARD_ALL,
            selected: [],
            excluded: DASHBOARD_SLIDES,
        });

        expect(available).toEqual(["PDF", "XLSX"]);
    });

    it("hides selected excluded formats and preserves them in the next selection", () => {
        const { available, visibleSelected, buildNextSelection } = partitionAttachments({
            all: DASHBOARD_ALL,
            selected: ["PDF_SLIDES", "PDF"],
            excluded: DASHBOARD_SLIDES,
        });

        expect(available).toEqual(["PDF", "XLSX"]);
        expect(visibleSelected).toEqual(["PDF"]);
        expect(buildNextSelection(["PDF", "XLSX"])).toEqual(["PDF", "XLSX", "PDF_SLIDES"]);
        // The load-bearing case: a hidden format survives even when the picker returns nothing.
        expect(buildNextSelection([])).toEqual(["PDF_SLIDES"]);
    });

    it("treats the widget single-slide PDF as hidden when slide formats are excluded", () => {
        const { available, visibleSelected, buildNextSelection } = partitionAttachments({
            all: WIDGET_ALL,
            selected: ["PPTX", "PDF", "PNG"],
            excluded: WIDGET_SLIDES,
        });

        expect(available).toEqual(["PNG", "PDF_TABULAR", "XLSX", "CSV", "CSV_RAW"]);
        expect(visibleSelected).toEqual(["PNG"]);
        expect(buildNextSelection(["PNG"])).toEqual(["PNG", "PPTX", "PDF"]);
    });

    it("keeps a selected excluded format hidden while offering the remaining formats", () => {
        const { available, visibleSelected, buildNextSelection } = partitionAttachments({
            all: WIDGET_ALL,
            selected: ["PDF_TABULAR", "PNG"],
            excluded: ["PDF_TABULAR"],
        });

        expect(available).toEqual(["PNG", "PPTX", "PDF", "XLSX", "CSV", "CSV_RAW"]);
        expect(visibleSelected).toEqual(["PNG"]);
        expect(buildNextSelection(["PNG", "XLSX"])).toEqual(["PNG", "XLSX", "PDF_TABULAR"]);
        // A hidden format passed back in `picked` is normalized away, not duplicated.
        expect(buildNextSelection(["PNG", "PDF_TABULAR", "XLSX"])).toEqual(["PNG", "XLSX", "PDF_TABULAR"]);
    });

    it("preserves a stored format the picker never offers", () => {
        // "HTML" is a WidgetAttachmentType that ALL_WIDGET_ATTACHMENTS omits entirely, and
        // selectedAttachments is read straight off stored export definitions — so a schedule can
        // legitimately hold a format that is not in `all`. Dropping it would destroy user data.
        const { available, visibleSelected, buildNextSelection } = partitionAttachments({
            all: WIDGET_ALL,
            selected: ["HTML", "PNG"],
        });

        expect(available).toEqual(WIDGET_ALL);
        expect(visibleSelected).toEqual(["PNG"]);
        expect(buildNextSelection(["PNG", "XLSX"])).toEqual(["PNG", "XLSX", "HTML"]);
    });
});
