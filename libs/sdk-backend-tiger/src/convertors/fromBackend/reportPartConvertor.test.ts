// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type AiReportPart } from "@gooddata/api-client-tiger";
import {
    type IReportContent,
    isReportHeadingSlot,
    isReportParagraphSlot,
    isReportVisualizationSlot,
} from "@gooddata/sdk-model";

import { REPORT_COPILOT_SAMPLE_PART } from "./reportCopilotSample.fixture.js";
import { convertReportPart } from "./reportPartConvertor.js";

const offContractPart = (fields: Record<string, unknown>) =>
    ({ type: "report", ...fields }) as unknown as AiReportPart;

const slotsOf = (content: IReportContent) => content.pages.flatMap((page) => page.slots);

describe("convertReportPart", () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        errorSpy.mockRestore();
    });

    describe("the sample draft", () => {
        const converted = convertReportPart(REPORT_COPILOT_SAMPLE_PART);
        const report = converted.report!;

        it("reads the report's title, description and period", () => {
            expect(report).toMatchObject({
                type: "report",
                title: "Top Customers — H2 2025",
                periodStart: "2025-07-01",
                periodEnd: "2025-12-31",
            });
            expect(report.description).toContain("leading customers");
        });

        it("keeps every page, in order", () => {
            expect(report.content.pages.map((page) => page.localIdentifier)).toEqual(["page1", "page2"]);
        });

        it("draws text as headings and paragraphs, which are the text slots the reports app knows", () => {
            const types = new Set(slotsOf(report.content).map((slot) => slot.type));

            expect(types).toEqual(new Set(["heading", "paragraph", "image", "visualization"]));
        });

        it("leaves text as it was written, placeholders included", () => {
            const coverTitle = slotsOf(report.content).find((slot) => slot.localIdentifier === "coverTitle");

            expect(coverTitle && isReportHeadingSlot(coverTitle) && coverTitle.source).toEqual({
                type: "static",
                content: "{reportTitle}",
            });
        });

        it("keeps how a slot is aligned", () => {
            const pageNumber = slotsOf(report.content).find(
                (slot) => slot.localIdentifier === "footerPageNumber",
            );

            expect(pageNumber && isReportParagraphSlot(pageNumber) && pageNumber.style).toMatchObject({
                horizontalAlign: "end",
                verticalAlign: "end",
            });
        });

        it("points each chart at the saved insight it names", () => {
            const insights = slotsOf(report.content)
                .filter(isReportVisualizationSlot)
                .map((slot) => slot.insight);

            expect(insights).toEqual([
                { identifier: "customers_trend", type: "insight" },
                { identifier: "percentage_of_customers_by_region", type: "insight" },
            ]);
        });

        it("keeps AI-written text with the prompt it came from", () => {
            const summary = slotsOf(report.content).find((slot) => slot.localIdentifier === "summary");

            expect(summary).toMatchObject({
                type: "paragraph",
                source: { type: "ai", prompt: expect.stringContaining("customer activity") },
            });
        });

        it("reports no saved id for a draft that has not been saved", () => {
            expect(converted.saved).toBeNull();
        });
    });

    it("carries the id of the report the draft was saved as", () => {
        const converted = convertReportPart({ ...REPORT_COPILOT_SAMPLE_PART, saved_report_id: "r-42" });

        expect(converted.saved).toBe("r-42");
        expect(converted.report).not.toBeNull();
    });

    it.each([
        ["carries the name of the draft", "report_1", "report_1"],
        ["leaves the name absent when the part has none", undefined, undefined],
        ["keeps a null name as null", null, null],
    ])("%s", (_description, reportRef, expected) => {
        const converted = convertReportPart({ ...REPORT_COPILOT_SAMPLE_PART, report_ref: reportRef });

        expect(converted.ref).toBe(expected);
    });

    it.each([
        ["carries the saved report the draft edits", "r-1", "r-1"],
        ["leaves it absent when the part has none", undefined, undefined],
        ["keeps null as null", null, null],
    ])("%s", (_description, baseReportId, expected) => {
        const converted = convertReportPart({ ...REPORT_COPILOT_SAMPLE_PART, base_report_id: baseReportId });

        expect(converted.baseReportId).toBe(expected);
    });

    it.each([
        ["carries the draft version this one reworks", "report_1", "report_1"],
        ["leaves it absent for a first draft", undefined, undefined],
        ["keeps null as null", null, null],
    ])("%s", (_description, refinesRef, expected) => {
        const converted = convertReportPart({ ...REPORT_COPILOT_SAMPLE_PART, refines_ref: refinesRef });

        expect(converted.refines).toBe(expected);
    });

    it("reads a part that names the as-code format the same as one that names none", () => {
        const named = convertReportPart({ ...REPORT_COPILOT_SAMPLE_PART, format: "aac-v1" });

        expect(named).toEqual(convertReportPart(REPORT_COPILOT_SAMPLE_PART));
    });

    describe("optional fields of the wrong type", () => {
        const readable = {
            type: "report",
            title: "Quarterly review",
            period: { start: "2025-01-01", end: "2025-02-01" },
            pages: [],
        };
        const convertWith = (fields: Record<string, unknown>) =>
            convertReportPart(offContractPart({ report: { ...readable, ...fields } })).report;

        it.each([
            ["a description that is not text", { description: 5 }, "description"],
            ["tags that are not a list", { tags: "x" }, "tags"],
            ["tags with entries that are not text", { tags: ["a", 2] }, "tags"],
            ["variable values that are not a map", { variable_values: "x" }, "variableValues"],
            ["variable values that are not text", { variable_values: { a: 1 } }, "variableValues"],
            ["variable values that are a list", { variable_values: ["a"] }, "variableValues"],
            ["an id that is not text", { id: 5 }, "ref"],
        ])("drops %s and keeps the rest of the report", (_description, fields, dropped) => {
            const report = convertWith(fields);

            expect(report).toMatchObject({
                type: "report",
                title: "Quarterly review",
                periodStart: "2025-01-01",
                periodEnd: "2025-02-01",
            });
            expect(report).not.toHaveProperty(dropped);
        });

        it("keeps the optional fields that are of the right type", () => {
            const report = convertWith({
                id: "r1",
                description: "About",
                tags: ["a", "b"],
                variable_values: { region: "EU" },
            });

            expect(report).toMatchObject({
                ref: { identifier: "r1" },
                description: "About",
                tags: ["a", "b"],
                variableValues: { region: "EU" },
            });
        });
    });

    describe("required fields of the wrong type", () => {
        const readable = {
            type: "report",
            title: "Quarterly review",
            period: { start: "2025-01-01", end: "2025-02-01" },
            pages: [],
        };
        const convertWith = (fields: Record<string, unknown>) =>
            convertReportPart(offContractPart({ report: { ...readable, ...fields } })).report;

        it.each([
            ["a title that is not text", { title: 5 }],
            ["a period start that is not text", { period: { start: 5, end: "2025-02-01" } }],
            ["a period end that is missing", { period: { start: "2025-01-01" } }],
        ])("keeps the part with no report for %s", (_description, fields) => {
            expect(convertWith(fields)).toBeNull();
            expect(errorSpy).toHaveBeenCalled();
        });

        it("keeps a report without a title, which reads as an empty one", () => {
            expect(convertWith({ title: undefined })).toMatchObject({ title: "" });
            expect(errorSpy).not.toHaveBeenCalled();
        });
    });

    describe("a report that cannot be shown", () => {
        it.each([
            ["is null", null],
            ["is missing", undefined],
        ])("keeps the part with no report when the report %s", (_description, report) => {
            const part: AiReportPart = { type: "report", report, saved_report_id: null };

            expect(convertReportPart(part)).toEqual({ type: "report", report: null, saved: null });
            expect(errorSpy).not.toHaveBeenCalled();
        });

        it.each([
            ["a string", "not a report"],
            ["a list", []],
            [
                "another document type the convertor could read",
                {
                    type: "dashboard",
                    id: "d",
                    title: "T",
                    period: { start: "2025-01-01", end: "2025-12-31" },
                },
            ],
            ["a report the convertor cannot read", { type: "report", id: "r", title: "No period" }],
        ])("keeps the part with no report when the report is %s", (_description, report) => {
            const converted = convertReportPart(offContractPart({ report }));

            expect(converted.report).toBeNull();
            expect(errorSpy).toHaveBeenCalled();
        });

        it("keeps the part with no report when the format is not one it knows", () => {
            const converted = convertReportPart(
                offContractPart({ ...REPORT_COPILOT_SAMPLE_PART, format: "aac-v99" }),
            );

            expect(converted.report).toBeNull();
            expect(errorSpy).toHaveBeenCalledWith('Unknown report format "aac-v99".');
        });

        it.each(["constructor", "toString", "__proto__"])(
            "does not mistake the inherited name %s for a format",
            (format) => {
                expect(
                    convertReportPart(offContractPart({ ...REPORT_COPILOT_SAMPLE_PART, format })).report,
                ).toBeNull();
            },
        );
    });
});
