// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IPublisherDocumentV2, type IPublisherPageTemplateV2, idRef } from "@gooddata/sdk-model";

import { PublisherContentNotSupportedError, assertPublisherEntitySupportedV2 } from "./index.js";

const pageTemplate: IPublisherPageTemplateV2 = {
    type: "pageTemplate",
    ref: idRef("layout1", "pageTemplate"),
    title: "Content",
    version: "2",
    content: { layout: { type: "text", id: "text" } },
};

function thrown(save: () => void): PublisherContentNotSupportedError {
    try {
        save();
    } catch (error) {
        expect(error).toBeInstanceOf(PublisherContentNotSupportedError);
        return error as PublisherContentNotSupportedError;
    }
    throw new Error("Expected PublisherContentNotSupportedError, nothing was thrown.");
}

describe("assertPublisherEntitySupportedV2", () => {
    it("accepts valid content", () => {
        expect(() => assertPublisherEntitySupportedV2(pageTemplate)).not.toThrow();
    });

    it("rejects saving a default page template", () => {
        const loadedDefault: IPublisherPageTemplateV2 = {
            ...pageTemplate,
            ref: idRef("default.cover", "pageTemplate"),
            isDefault: true,
        };

        const error = thrown(() => assertPublisherEntitySupportedV2(loadedDefault));

        expect(error.details.issues.map((issue) => issue.path)).toEqual(["ref"]);
    });

    it("accepts a loaded document with the references its user may not read", () => {
        const loaded: IPublisherDocumentV2 = {
            type: "document",
            ref: idRef("doc1", "document"),
            title: "Review",
            version: "2",
            period: { type: "relative", granularity: "GDC.time.month", from: -1, to: -1 },
            content: { pages: [{ id: "page", layout: { type: "text", id: "text" } }] },
            unavailable: [{ ref: idRef("revenue", "insight"), type: "insight", reason: "forbidden" }],
        };

        expect(() => assertPublisherEntitySupportedV2(loaded)).not.toThrow();
    });

    it("names the kind and the title in the message", () => {
        const error = thrown(() =>
            assertPublisherEntitySupportedV2({
                ...pageTemplate,
                content: { layout: { type: "text", id: "" } },
            }),
        );

        expect(error.message).toBe(
            'The page template "Content" could not be saved: it fails the validation.',
        );
    });

    it("leaves an empty title out of the message", () => {
        const error = thrown(() => assertPublisherEntitySupportedV2({ ...pageTemplate, title: "" }));

        expect(error.message).toBe("The page template could not be saved: it fails the validation.");
        expect(error.details.title).toBe("");
    });
});
