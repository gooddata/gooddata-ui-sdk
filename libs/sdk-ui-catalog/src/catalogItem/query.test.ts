// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IPublisherDocumentDefinitionV2 } from "@gooddata/sdk-model";

import { updateCatalogItem } from "./query.js";
import type { ICatalogItemDocument } from "./types.js";

const stored: IPublisherDocumentDefinitionV2 = {
    type: "document",
    title: "Northwind",
    description: "Sales",
    tags: ["sales"],
    version: "2",
    period: { type: "relative", granularity: "GDC.time.month", from: -6, to: -1 },
    content: {
        pages: [
            {
                id: "page_a",
                layout: { type: "column", children: [{ type: "title", id: "t", markdown: "Revenue" }] },
            },
        ],
    },
};

describe("updateCatalogItem", () => {
    it("saves only the changed document field, so a newer value of another field survives", async () => {
        const backend = dummyBackend();
        const publisher = backend.workspace("ws").publisherV2();
        const created = await publisher.createDocument(stored);
        const identifier = (created.ref as { identifier: string }).identifier;
        const loaded = { identifier, type: "document", title: "Northwind", tags: ["sales"] };
        await publisher.updateDocumentMeta({ ref: created.ref, title: "Renamed in Reports" });

        await updateCatalogItem(
            backend,
            "ws",
            { ...loaded, tags: ["sales", "finance"] } as ICatalogItemDocument,
            {
                tags: ["sales", "finance"],
            },
        );

        await expect(publisher.getDocument(created.ref)).resolves.toMatchObject({
            title: "Renamed in Reports",
            tags: ["sales", "finance"],
        });
    });
});
