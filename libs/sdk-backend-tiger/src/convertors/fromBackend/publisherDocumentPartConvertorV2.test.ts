// (C) 2026 GoodData Corporation

import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type AiPublisherDocumentPart } from "@gooddata/api-client-tiger";
import { publisherDocumentDefinitionToYamlV2 } from "@gooddata/sdk-code-convertors";
import { idRef } from "@gooddata/sdk-model";

import { convertPublisherDocumentPartV2 } from "./publisherDocumentPartConvertorV2.js";
import { absolutePeriodDocumentV2 } from "./publisherV2.fixture.js";

const savedDocument = { ...absolutePeriodDocumentV2, ref: idRef("northwind_h1") };

const draftPart: AiPublisherDocumentPart = {
    type: "document",
    format: "aac-v2",
    document_ref: "report_2",
    document: publisherDocumentDefinitionToYamlV2(savedDocument).json,
    page_count: 1,
    base_document_id: "northwind_h1",
    saved_document_id: null,
    refines_ref: "report_1",
    reworks_open_document: true,
};

describe("convertPublisherDocumentPartV2", () => {
    let errorSpy: MockInstance<typeof console.error>;

    beforeEach(() => {
        errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        errorSpy.mockRestore();
    });

    it("reads the draft's document and its conversation fields", () => {
        expect(convertPublisherDocumentPartV2(draftPart)).toEqual({
            type: "publisherDocumentV2",
            publisherDocument: savedDocument,
            ref: "report_2",
            saved: null,
            baseDocumentId: "northwind_h1",
            refines: "report_1",
            reworksOpenDocument: true,
        });
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("reads a document without an id as one with no reference", () => {
        const converted = convertPublisherDocumentPartV2({
            ...draftPart,
            document: publisherDocumentDefinitionToYamlV2(absolutePeriodDocumentV2).json,
        });

        expect(converted.publisherDocument).toEqual(absolutePeriodDocumentV2);
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("carries the id of the document the draft was saved as", () => {
        expect(convertPublisherDocumentPartV2({ ...draftPart, saved_document_id: "d-42" }).saved).toBe(
            "d-42",
        );
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("leaves reworksOpenDocument absent when the part does not rework the open document", () => {
        const converted = convertPublisherDocumentPartV2({ ...draftPart, reworks_open_document: false });

        expect(converted).not.toHaveProperty("reworksOpenDocument");
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("keeps a part without a document, with nothing to log", () => {
        const converted = convertPublisherDocumentPartV2({ ...draftPart, document: null });

        expect(converted).toMatchObject({
            type: "publisherDocumentV2",
            publisherDocument: null,
            ref: "report_2",
        });
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it.each([
        [
            "a v1 report in place of a document",
            { document: { type: "report", title: "Q1" } },
            ["The document part does not carry a document."],
        ],
        [
            "a document of an unknown version",
            { document: { ...draftPart.document, version: "3" } },
            [expect.any(Error)],
        ],
        [
            "a document that fails validation",
            { document: { ...draftPart.document, title: 5 } },
            ["The document part's document is not valid.", expect.any(Array)],
        ],
        [
            "a document the convertor cannot read",
            { document: { type: "document", version: "2" } },
            [expect.any(Error)],
        ],
    ])("keeps the part with no document and logs why for %s", (_description, fields, logged) => {
        const converted = convertPublisherDocumentPartV2({ ...draftPart, ...fields });

        expect(converted).toMatchObject({
            type: "publisherDocumentV2",
            publisherDocument: null,
            ref: "report_2",
        });
        expect(errorSpy).toHaveBeenCalledOnce();
        expect(errorSpy).toHaveBeenCalledWith(...logged);
    });
});
