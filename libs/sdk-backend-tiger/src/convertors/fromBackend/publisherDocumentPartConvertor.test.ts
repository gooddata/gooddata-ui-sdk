// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type AiReportPart } from "@gooddata/api-client-tiger";
import {
    type IPublisherDocumentContent,
    isPublisherHeadingSlot,
    isPublisherParagraphSlot,
    isPublisherVisualizationSlot,
} from "@gooddata/sdk-model";

import { PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART } from "./publisherDocumentCopilotSample.fixture.js";
import { convertPublisherDocumentPart } from "./publisherDocumentPartConvertor.js";

const offContractPart = (fields: Record<string, unknown>) =>
    ({ type: "report", ...fields }) as unknown as AiReportPart;

const slotsOf = (content: IPublisherDocumentContent) => content.pages.flatMap((page) => page.slots);

describe("convertPublisherDocumentPart", () => {
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        errorSpy.mockRestore();
    });

    describe("the sample draft", () => {
        const converted = convertPublisherDocumentPart(PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART);
        const publisherDocument = converted.publisherDocument!;

        it("reads the document's title, description and period", () => {
            expect(publisherDocument).toMatchObject({
                type: "report",
                title: "Top Customers — H2 2025",
                periodStart: "2025-07-01",
                periodEnd: "2025-12-31",
            });
            expect(publisherDocument.description).toContain("leading customers");
        });

        it("keeps every page, in order", () => {
            expect(publisherDocument.content.pages.map((page) => page.localIdentifier)).toEqual([
                "page1",
                "page2",
            ]);
        });

        it("draws text as headings and paragraphs, which are the text slots the publisher knows", () => {
            const types = new Set(slotsOf(publisherDocument.content).map((slot) => slot.type));

            expect(types).toEqual(new Set(["heading", "paragraph", "image", "visualization"]));
        });

        it("leaves text as it was written, placeholders included", () => {
            const coverTitle = slotsOf(publisherDocument.content).find(
                (slot) => slot.localIdentifier === "coverTitle",
            );

            expect(coverTitle && isPublisherHeadingSlot(coverTitle) && coverTitle.source).toEqual({
                type: "static",
                content: "{reportTitle}",
            });
        });

        it("keeps how a slot is aligned", () => {
            const pageNumber = slotsOf(publisherDocument.content).find(
                (slot) => slot.localIdentifier === "footerPageNumber",
            );

            expect(pageNumber && isPublisherParagraphSlot(pageNumber) && pageNumber.style).toMatchObject({
                horizontalAlign: "end",
                verticalAlign: "end",
            });
        });

        it("points each chart at the saved insight it names", () => {
            const insights = slotsOf(publisherDocument.content)
                .filter(isPublisherVisualizationSlot)
                .map((slot) => slot.insight);

            expect(insights).toEqual([
                { identifier: "customers_trend", type: "insight" },
                { identifier: "percentage_of_customers_by_region", type: "insight" },
            ]);
        });

        it("keeps AI-written text with the prompt it came from", () => {
            const summary = slotsOf(publisherDocument.content).find(
                (slot) => slot.localIdentifier === "summary",
            );

            expect(summary).toMatchObject({
                type: "paragraph",
                source: { type: "ai", prompt: expect.stringContaining("customer activity") },
            });
        });

        it("reports no saved id for a draft that has not been saved", () => {
            expect(converted.saved).toBeNull();
        });
    });

    it("carries the id of the document the draft was saved as", () => {
        const converted = convertPublisherDocumentPart({
            ...PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART,
            saved_report_id: "r-42",
        });

        expect(converted.saved).toBe("r-42");
        expect(converted.publisherDocument).not.toBeNull();
    });

    it.each([
        ["carries the name of the draft", "report_1", "report_1"],
        ["leaves the name absent when the part has none", undefined, undefined],
        ["keeps a null name as null", null, null],
    ])("%s", (_description, documentRef, expected) => {
        const converted = convertPublisherDocumentPart({
            ...PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART,
            report_ref: documentRef,
        });

        expect(converted.ref).toBe(expected);
    });

    it.each([
        ["carries the saved document the draft edits", "r-1", "r-1"],
        ["leaves it absent when the part has none", undefined, undefined],
        ["keeps null as null", null, null],
    ])("%s", (_description, baseDocumentId, expected) => {
        const converted = convertPublisherDocumentPart({
            ...PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART,
            base_report_id: baseDocumentId,
        });

        expect(converted.baseDocumentId).toBe(expected);
    });

    it.each([
        ["carries the draft version this one reworks", "report_1", "report_1"],
        ["leaves it absent for a first draft", undefined, undefined],
        ["keeps null as null", null, null],
    ])("%s", (_description, refinesRef, expected) => {
        const converted = convertPublisherDocumentPart({
            ...PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART,
            refines_ref: refinesRef,
        });

        expect(converted.refines).toBe(expected);
    });

    it("reads a part that names the as-code format the same as one that names none", () => {
        const named = convertPublisherDocumentPart({
            ...PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART,
            format: "aac-v1",
        });

        expect(named).toEqual(convertPublisherDocumentPart(PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART));
    });

    describe("optional fields of the wrong type", () => {
        const readable = {
            type: "report",
            title: "Quarterly review",
            period: { start: "2025-01-01", end: "2025-02-01" },
            pages: [],
        };
        const convertWith = (fields: Record<string, unknown>) =>
            convertPublisherDocumentPart(offContractPart({ report: { ...readable, ...fields } }))
                .publisherDocument;

        it.each([
            ["a description that is not text", { description: 5 }, "description"],
            ["tags that are not a list", { tags: "x" }, "tags"],
            ["tags with entries that are not text", { tags: ["a", 2] }, "tags"],
            ["variable values that are not a map", { variable_values: "x" }, "variableValues"],
            ["variable values that are not text", { variable_values: { a: 1 } }, "variableValues"],
            ["variable values that are a list", { variable_values: ["a"] }, "variableValues"],
            ["an id that is not text", { id: 5 }, "ref"],
        ])("drops %s and keeps the rest of the document", (_description, fields, dropped) => {
            const publisherDocument = convertWith(fields);

            expect(publisherDocument).toMatchObject({
                type: "report",
                title: "Quarterly review",
                periodStart: "2025-01-01",
                periodEnd: "2025-02-01",
            });
            expect(publisherDocument).not.toHaveProperty(dropped);
        });

        it("keeps the optional fields that are of the right type", () => {
            const publisherDocument = convertWith({
                id: "r1",
                description: "About",
                tags: ["a", "b"],
                variable_values: { region: "EU" },
            });

            expect(publisherDocument).toMatchObject({
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
            convertPublisherDocumentPart(offContractPart({ report: { ...readable, ...fields } }))
                .publisherDocument;

        it.each([
            ["a title that is not text", { title: 5 }],
            ["a period start that is not text", { period: { start: 5, end: "2025-02-01" } }],
            ["a period end that is missing", { period: { start: "2025-01-01" } }],
        ])("keeps the part with no document for %s", (_description, fields) => {
            expect(convertWith(fields)).toBeNull();
            expect(errorSpy).toHaveBeenCalled();
        });

        it("keeps a document without a title, which reads as an empty one", () => {
            expect(convertWith({ title: undefined })).toMatchObject({ title: "" });
            expect(errorSpy).not.toHaveBeenCalled();
        });
    });

    describe("a document that cannot be shown", () => {
        it.each([
            ["is null", null],
            ["is missing", undefined],
        ])("keeps the part with no document when the document %s", (_description, publisherDocument) => {
            const part: AiReportPart = { type: "report", report: publisherDocument, saved_report_id: null };

            expect(convertPublisherDocumentPart(part)).toEqual({
                type: "publisherDocument",
                publisherDocument: null,
                saved: null,
            });
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
        ])("keeps the part with no document when the document is %s", (_description, publisherDocument) => {
            const converted = convertPublisherDocumentPart(offContractPart({ report: publisherDocument }));

            expect(converted.publisherDocument).toBeNull();
            expect(errorSpy).toHaveBeenCalled();
        });

        it("keeps the part with no document when the format is not one it knows", () => {
            const converted = convertPublisherDocumentPart(
                offContractPart({ ...PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART, format: "aac-v99" }),
            );

            expect(converted.publisherDocument).toBeNull();
            expect(errorSpy).toHaveBeenCalledWith('Unknown document format "aac-v99".');
        });

        it.each(["constructor", "toString", "__proto__"])(
            "does not mistake the inherited name %s for a format",
            (format) => {
                expect(
                    convertPublisherDocumentPart(
                        offContractPart({ ...PUBLISHER_DOCUMENT_COPILOT_SAMPLE_PART, format }),
                    ).publisherDocument,
                ).toBeNull();
            },
        );
    });
});
