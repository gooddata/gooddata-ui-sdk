// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { PublisherContentNotSupportedError } from "@gooddata/sdk-backend-spi";
import {
    type IPublisherDocumentDefinitionV2,
    type IPublisherPageBodyV2,
    type IPublisherPageTemplateDefinitionV2,
    idRef,
} from "@gooddata/sdk-model";

import { InMemoryWorkspacePublisherServiceV2 } from "./InMemoryWorkspacePublisherServiceV2.js";

const pageBody: IPublisherPageBodyV2 = {
    layout: { type: "column", children: [{ type: "title", id: "pageTitle", markdown: "Revenue" }] },
};

const publisherDocument: IPublisherDocumentDefinitionV2 = {
    type: "document",
    title: "Northwind",
    version: "2",
    period: { type: "relative", granularity: "GDC.time.month", from: -6, to: -1 },
    content: { pages: [{ ...pageBody, id: "page_a" }] },
};

const pageTemplate: IPublisherPageTemplateDefinitionV2 = {
    type: "pageTemplate",
    title: "Content",
    version: "2",
    content: pageBody,
};

describe("InMemoryWorkspacePublisherServiceV2", () => {
    it("serves no default page templates", async () => {
        await expect(new InMemoryWorkspacePublisherServiceV2().getPageTemplates()).resolves.toEqual([]);
    });

    it("round-trips a valid document and lists it as supported", async () => {
        const service = new InMemoryWorkspacePublisherServiceV2();

        const created = await service.createDocument(publisherDocument);

        expect(created).toEqual({ ...publisherDocument, ref: created.ref });
        await expect(service.getDocument(created.ref)).resolves.toEqual(created);
        await expect(service.getDocuments()).resolves.toEqual([{ supported: true, document: created }]);

        await service.deleteDocument(created.ref);
        await expect(service.getDocuments()).resolves.toEqual([]);
    });

    it("round-trips a valid page template", async () => {
        const service = new InMemoryWorkspacePublisherServiceV2();

        const created = await service.createPageTemplate(pageTemplate);
        const updated = await service.updatePageTemplate({ ...created, title: "Renamed" });

        await expect(service.getPageTemplates()).resolves.toEqual([updated]);
    });

    it("rejects invalid content on create and update and stores nothing", async () => {
        const service = new InMemoryWorkspacePublisherServiceV2();
        const created = await service.createDocument(publisherDocument);

        await expect(service.createDocument({ ...publisherDocument, title: "" })).rejects.toBeInstanceOf(
            PublisherContentNotSupportedError,
        );
        await expect(
            service.updateDocument({
                ...created,
                period: { type: "relative", granularity: "GDC.time.month", from: 1.5, to: 2 },
            }),
        ).rejects.toMatchObject({ details: { issues: [expect.objectContaining({ path: "period.from" })] } });
        await expect(service.getDocuments()).resolves.toEqual([{ supported: true, document: created }]);
    });

    it("stores a copy of a default page template as an ordinary one", async () => {
        const service = new InMemoryWorkspacePublisherServiceV2();
        const copyOfDefault: IPublisherPageTemplateDefinitionV2 & { isDefault: boolean } = {
            ...pageTemplate,
            isDefault: true,
        };

        const created = await service.createPageTemplate(copyOfDefault);

        expect(created).not.toHaveProperty("isDefault");
    });

    it("rejects saving a default page template", async () => {
        const service = new InMemoryWorkspacePublisherServiceV2();
        const created = await service.createPageTemplate(pageTemplate);

        await expect(
            service.updatePageTemplate({
                ...created,
                ref: idRef("default.cover", "pageTemplate"),
                isDefault: true,
            }),
        ).rejects.toBeInstanceOf(PublisherContentNotSupportedError);
    });

    it("rejects a page template id reserved for the defaults", async () => {
        await expect(
            new InMemoryWorkspacePublisherServiceV2().createPageTemplate({
                ...pageTemplate,
                ref: idRef("default.cover", "pageTemplate"),
            }),
        ).rejects.toBeInstanceOf(PublisherContentNotSupportedError);
    });
});
