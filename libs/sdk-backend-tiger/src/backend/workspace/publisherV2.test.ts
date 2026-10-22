// (C) 2026 GoodData Corporation

import axios from "axios";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type EntitiesApiCreateEntityDocumentsRequest,
    type ITigerClientBase,
    type JsonApiPublisherDocumentOutWithLinks,
} from "@gooddata/api-client-tiger";
import type * as EntitiesObjectsModule from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import type * as ExportModule from "@gooddata/api-client-tiger/endpoints/export";
import {
    type IWorkspacePublisherServiceV2,
    PublisherContentNotSupportedError,
} from "@gooddata/sdk-backend-spi";
import { type IPublisherDocumentDefinitionV2, type ObjRef, idRef } from "@gooddata/sdk-model";

import {
    absolutePeriodDocumentV2,
    auditRelationshipsV2,
    auditUsersV2,
    documentOutV2,
    documentTemplateOutV2,
    documentTemplateV2,
    pageTemplateOutV2,
    pageTemplateV2,
    parentOriginMetaV2,
    relativePeriodDocumentV2,
} from "../../convertors/fromBackend/publisherV2.fixture.js";
import { type TigerAuthenticatedCallGuard } from "../../types/index.js";

import { type TigerWorkspacePublisherServiceV2 as TigerWorkspacePublisherServiceV2Type } from "./publisherV2.js";

type EndpointMock = ReturnType<typeof vi.fn>;

function mockEveryExport<T extends object>(actual: T): Record<string, EndpointMock> {
    return Object.fromEntries(Object.keys(actual).map((name) => [name, vi.fn()]));
}

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", async (importOriginal) =>
    mockEveryExport(await importOriginal<typeof EntitiesObjectsModule>()),
);
vi.mock("@gooddata/api-client-tiger/endpoints/export", async (importOriginal) =>
    mockEveryExport(await importOriginal<typeof ExportModule>()),
);

const client: ITigerClientBase = { axios: axios.create(), basePath: "", setApiToken: () => {} };
const authCall: TigerAuthenticatedCallGuard = (call) =>
    call(client, { getPrincipal: () => Promise.resolve({ userId: "user" }) });

let TigerWorkspacePublisherServiceV2: typeof TigerWorkspacePublisherServiceV2Type;
let endpoints: Map<string, EndpointMock>;

beforeAll(async () => {
    // A fresh module registry makes the service pick up the mocks above even when another
    // (non-isolated) test file already imported it with different mocks or none.
    vi.resetModules();
    ({ TigerWorkspacePublisherServiceV2 } = await import("./publisherV2.js"));
    const modules = await Promise.all([
        import("@gooddata/api-client-tiger/endpoints/entitiesObjects"),
        import("@gooddata/api-client-tiger/endpoints/export"),
    ]);
    endpoints = new Map(
        modules.flatMap((module) =>
            Object.entries(module).filter((entry): entry is [string, EndpointMock] =>
                vi.isMockFunction(entry[1]),
            ),
        ),
    );
});

function endpoint(name: string): EndpointMock {
    const mock = endpoints.get(name);
    if (!mock) {
        throw new Error(`The endpoint ${name} is not mocked.`);
    }
    return mock;
}

function calledEndpoints(): string[] {
    return [...endpoints].filter(([, mock]) => mock.mock.calls.length > 0).map(([name]) => name);
}

function newService(): TigerWorkspacePublisherServiceV2Type {
    return new TigerWorkspacePublisherServiceV2(authCall, "ws1");
}

const documentRef = idRef("doc1", "document");
const documentTemplateRef = idRef("template1", "documentTemplate");
const pageTemplateRef = idRef("layout1", "pageTemplate");
const defaultRef = idRef("default.cover", "pageTemplate");

const storedDocument = { ...absolutePeriodDocumentV2, ref: documentRef };
const storedDocumentTemplate = { ...documentTemplateV2, ref: documentTemplateRef };
const storedPageTemplate = { ...pageTemplateV2, ref: pageTemplateRef };

const single = (data: unknown) => ({ data: { data } });
const list = (data: unknown[]) => ({ data: { data } });

interface IMethodCase {
    endpoints: string[];
    call: (service: IWorkspacePublisherServiceV2) => Promise<unknown>;
}

const methodCases: Record<keyof IWorkspacePublisherServiceV2, IMethodCase> = {
    getPageTemplates: {
        endpoints: ["EntitiesApi_GetAllEntitiesPageTemplates"],
        call: (service) => service.getPageTemplates(),
    },
    getPageTemplate: {
        endpoints: ["EntitiesApi_GetEntityPageTemplates"],
        call: (service) => service.getPageTemplate(pageTemplateRef),
    },
    createPageTemplate: {
        endpoints: ["EntitiesApi_CreateEntityPageTemplates"],
        call: (service) => service.createPageTemplate(pageTemplateV2),
    },
    updatePageTemplate: {
        endpoints: ["EntitiesApi_UpdateEntityPageTemplates"],
        call: (service) => service.updatePageTemplate(storedPageTemplate),
    },
    deletePageTemplate: {
        endpoints: ["EntitiesApi_DeleteEntityPageTemplates"],
        call: (service) => service.deletePageTemplate(pageTemplateRef),
    },
    getDocumentTemplates: {
        endpoints: ["EntitiesApi_GetAllEntitiesDocumentTemplates"],
        call: (service) => service.getDocumentTemplates(),
    },
    getDocumentTemplate: {
        endpoints: ["EntitiesApi_GetEntityDocumentTemplates"],
        call: (service) => service.getDocumentTemplate(documentTemplateRef),
    },
    createDocumentTemplate: {
        endpoints: ["EntitiesApi_CreateEntityDocumentTemplates"],
        call: (service) => service.createDocumentTemplate(documentTemplateV2),
    },
    updateDocumentTemplate: {
        endpoints: ["EntitiesApi_UpdateEntityDocumentTemplates"],
        call: (service) => service.updateDocumentTemplate(storedDocumentTemplate),
    },
    deleteDocumentTemplate: {
        endpoints: ["EntitiesApi_DeleteEntityDocumentTemplates"],
        call: (service) => service.deleteDocumentTemplate(documentTemplateRef),
    },
    getDocuments: {
        endpoints: ["EntitiesApi_GetAllEntitiesDocuments"],
        call: (service) => service.getDocuments(),
    },
    getDocument: {
        endpoints: ["EntitiesApi_GetEntityDocuments"],
        call: (service) => service.getDocument(documentRef),
    },
    createDocument: {
        endpoints: ["EntitiesApi_CreateEntityDocuments"],
        call: (service) => service.createDocument(absolutePeriodDocumentV2),
    },
    updateDocument: {
        endpoints: ["EntitiesApi_UpdateEntityDocuments"],
        call: (service) => service.updateDocument(storedDocument),
    },
    deleteDocument: {
        endpoints: ["EntitiesApi_DeleteEntityDocuments"],
        call: (service) => service.deleteDocument(documentRef),
    },
    exportDocumentToPdf: {
        endpoints: ["ExportApi_CreateDocumentExport", "ExportApi_GetDocumentExport"],
        call: (service) => service.exportDocumentToPdf(documentRef, { filename: "northwind" }),
    },
};

function respondToEveryEndpoint(): void {
    for (const [name, mock] of endpoints) {
        if (name.startsWith("EntitiesApi_GetAllEntities")) {
            mock.mockResolvedValue(list([]));
        } else if (name.startsWith("EntitiesApi_Delete")) {
            mock.mockResolvedValue({});
        }
    }
    for (const name of ["Get", "Create", "Update"]) {
        endpoint(`EntitiesApi_${name}EntityDocuments`).mockResolvedValue(single(documentOutV2("doc1")));
        endpoint(`EntitiesApi_${name}EntityDocumentTemplates`).mockResolvedValue(
            single(documentTemplateOutV2("template1")),
        );
        endpoint(`EntitiesApi_${name}EntityPageTemplates`).mockResolvedValue(
            single(pageTemplateOutV2("layout1")),
        );
    }
    endpoint("ExportApi_CreateDocumentExport").mockResolvedValue({ data: { exportResult: "export1" } });
    endpoint("ExportApi_GetDocumentExport").mockResolvedValue({
        status: 200,
        data: new Blob(["pdf"]),
        config: { url: "/export/document/export1" },
        headers: {},
    });
}

beforeEach(() => {
    respondToEveryEndpoint();
});

describe("TigerWorkspacePublisherServiceV2 endpoints", () => {
    it("covers every method of the service", () => {
        const constructorFields = ["authCall"];
        const methods = Object.entries(newService())
            .filter(([name, value]) => typeof value === "function" && !constructorFields.includes(name))
            .map(([name]) => name);

        expect(methods.sort()).toEqual(Object.keys(methodCases).sort());
    });

    it("mocks the report endpoints, so a call to one of them would be seen", () => {
        expect(endpoint("EntitiesApi_GetAllEntitiesReports")).toBeDefined();
        expect(endpoint("ExportApi_CreateReportExport")).toBeDefined();
    });

    it.each(Object.entries(methodCases))(
        "%s calls only its v2 endpoints, never a report endpoint",
        async (_, { endpoints: expected, call }) => {
            await call(newService());

            const called = calledEndpoints();
            expect(called.sort()).toEqual([...expected].sort());
        },
    );

    it("exports by documentId, never by reportId", async () => {
        await newService().exportDocumentToPdf(documentRef, { filename: "northwind" });

        const [, , request] = endpoint("ExportApi_CreateDocumentExport").mock.calls[0]!;
        expect(request).toEqual({
            workspaceId: "ws1",
            exportReportExportRequest: { format: "PDF", documentId: "doc1", fileName: "northwind" },
        });
    });
});

function expectRequest(endpointName: string, request: Record<string, unknown>): void {
    expect(endpoint(endpointName)).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining(request),
    );
}

const originAndAudit = { metaInclude: ["origin"], include: ["createdBy", "modifiedBy"] };
const audit = { include: ["createdBy", "modifiedBy"] };
const byLastChange = { sort: ["modifiedAt,desc"] };

describe("TigerWorkspacePublisherServiceV2 requests", () => {
    it.each<[keyof IWorkspacePublisherServiceV2, string, Record<string, unknown>]>([
        ["getDocuments", "EntitiesApi_GetAllEntitiesDocuments", { ...originAndAudit, ...byLastChange }],
        ["getDocument", "EntitiesApi_GetEntityDocuments", originAndAudit],
        [
            "getDocumentTemplates",
            "EntitiesApi_GetAllEntitiesDocumentTemplates",
            { ...originAndAudit, ...byLastChange },
        ],
        ["getDocumentTemplate", "EntitiesApi_GetEntityDocumentTemplates", originAndAudit],
        ["getPageTemplates", "EntitiesApi_GetAllEntitiesPageTemplates", originAndAudit],
        ["getPageTemplate", "EntitiesApi_GetEntityPageTemplates", originAndAudit],
        ["createDocument", "EntitiesApi_CreateEntityDocuments", audit],
        ["updateDocument", "EntitiesApi_UpdateEntityDocuments", audit],
        ["createDocumentTemplate", "EntitiesApi_CreateEntityDocumentTemplates", audit],
        ["updateDocumentTemplate", "EntitiesApi_UpdateEntityDocumentTemplates", audit],
        ["createPageTemplate", "EntitiesApi_CreateEntityPageTemplates", audit],
        ["updatePageTemplate", "EntitiesApi_UpdateEntityPageTemplates", audit],
    ])("%s sends its request options to %s", async (method, endpointName, request) => {
        await methodCases[method].call(newService());

        expectRequest(endpointName, request);
    });

    it("loads a document with its creator and its parent origin", async () => {
        endpoint("EntitiesApi_GetEntityDocuments").mockResolvedValue({
            data: {
                data: {
                    ...documentOutV2("doc1"),
                    meta: parentOriginMetaV2,
                    relationships: auditRelationshipsV2,
                },
                included: auditUsersV2,
            },
        });

        const loaded = await newService().getDocument(documentRef);

        expect(loaded.createdBy?.login).toBe("alice");
        expect(loaded.updatedBy?.login).toBe("bob");
        expect(loaded.isLocked).toBe(true);
    });

    it("lists documents with their creators and their parent origin", async () => {
        endpoint("EntitiesApi_GetAllEntitiesDocuments").mockResolvedValue({
            data: {
                data: [
                    {
                        ...documentOutV2("doc1"),
                        meta: parentOriginMetaV2,
                        relationships: auditRelationshipsV2,
                    },
                ],
                included: auditUsersV2,
            },
        });

        const [item] = await newService().getDocuments();

        if (!item?.supported) {
            throw new Error("Expected a supported item.");
        }
        expect(item.document.createdBy?.login).toBe("alice");
        expect(item.document.isLocked).toBe(true);
    });
});

describe("TigerWorkspacePublisherServiceV2 validation", () => {
    it.each<[string, (service: IWorkspacePublisherServiceV2) => Promise<unknown>, string]>([
        [
            "createDocument",
            (service) => service.createDocument({ ...absolutePeriodDocumentV2, title: "" }),
            "EntitiesApi_CreateEntityDocuments",
        ],
        [
            "updateDocument",
            (service) => service.updateDocument({ ...storedDocument, title: "" }),
            "EntitiesApi_UpdateEntityDocuments",
        ],
        [
            "createDocumentTemplate",
            (service) => service.createDocumentTemplate({ ...documentTemplateV2, title: "" }),
            "EntitiesApi_CreateEntityDocumentTemplates",
        ],
        [
            "updateDocumentTemplate",
            (service) => service.updateDocumentTemplate({ ...storedDocumentTemplate, title: "" }),
            "EntitiesApi_UpdateEntityDocumentTemplates",
        ],
        [
            "createPageTemplate",
            (service) => service.createPageTemplate({ ...pageTemplateV2, title: "" }),
            "EntitiesApi_CreateEntityPageTemplates",
        ],
        [
            "updatePageTemplate",
            (service) => service.updatePageTemplate({ ...storedPageTemplate, title: "" }),
            "EntitiesApi_UpdateEntityPageTemplates",
        ],
    ])("%s rejects invalid content without calling the backend", async (_, save, endpointName) => {
        await expect(save(newService())).rejects.toBeInstanceOf(PublisherContentNotSupportedError);
        expect(endpoint(endpointName)).not.toHaveBeenCalled();
    });

    it.each<[string, (service: IWorkspacePublisherServiceV2) => Promise<unknown>, string]>([
        [
            "updatePageTemplate",
            async (service) => service.updatePageTemplate(await service.getPageTemplate(defaultRef)),
            "EntitiesApi_UpdateEntityPageTemplates",
        ],
        [
            "createPageTemplate",
            async (service) => service.createPageTemplate(await service.getPageTemplate(defaultRef)),
            "EntitiesApi_CreateEntityPageTemplates",
        ],
    ])(
        "%s rejects a loaded default page template under its default. id without calling the backend",
        async (_, save, endpointName) => {
            endpoint("EntitiesApi_GetEntityPageTemplates").mockResolvedValue(
                single(pageTemplateOutV2(defaultRef.identifier)),
            );

            await expect(save(newService())).rejects.toBeInstanceOf(PublisherContentNotSupportedError);
            expect(endpoint(endpointName)).not.toHaveBeenCalled();
        },
    );

    it("creates a copy of a loaded default page template under a new id", async () => {
        endpoint("EntitiesApi_GetEntityPageTemplates").mockResolvedValue(
            single(pageTemplateOutV2(defaultRef.identifier)),
        );
        endpoint("EntitiesApi_CreateEntityPageTemplates").mockResolvedValue(
            single(pageTemplateOutV2("cover_copy")),
        );
        const service = newService();
        const { ref: _ref, isDefault: _isDefault, ...content } = await service.getPageTemplate(defaultRef);

        const copy = await service.createPageTemplate({
            ...content,
            ref: idRef("cover_copy", "pageTemplate"),
        });

        expect(copy).not.toHaveProperty("isDefault");
        expect(endpoint("EntitiesApi_CreateEntityPageTemplates")).toHaveBeenCalledWith(
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                jsonApiPublisherDocumentPageTemplatePostOptionalIdDocument: {
                    data: expect.objectContaining({
                        id: "cover_copy",
                        attributes: expect.not.objectContaining({ isDefault: expect.anything() }),
                    }),
                },
            }),
        );
    });

    it.each<[string, string, unknown, (service: IWorkspacePublisherServiceV2) => Promise<unknown>]>([
        [
            "getDocument",
            "EntitiesApi_GetEntityDocuments",
            documentOutV2("doc1", { version: "3" }),
            (service) => service.getDocument(documentRef),
        ],
        [
            "getDocumentTemplate",
            "EntitiesApi_GetEntityDocumentTemplates",
            documentTemplateOutV2("template1", { version: "3" }),
            (service) => service.getDocumentTemplate(documentTemplateRef),
        ],
        [
            "getPageTemplate",
            "EntitiesApi_GetEntityPageTemplates",
            pageTemplateOutV2("layout1", { version: "3" }),
            (service) => service.getPageTemplate(pageTemplateRef),
        ],
    ])("%s rejects an unreadable stored entity", async (_, endpointName, stored, load) => {
        endpoint(endpointName).mockResolvedValue(single(stored));

        await expect(load(newService())).rejects.toBeInstanceOf(PublisherContentNotSupportedError);
    });
});

describe("TigerWorkspacePublisherServiceV2 document period", () => {
    it.each<[string, IPublisherDocumentDefinitionV2]>([
        ["absolute", absolutePeriodDocumentV2],
        ["relative", relativePeriodDocumentV2],
    ])("loads the %s period a created document was saved with", async (_, definition) => {
        const service = newService();
        await service.createDocument(definition);
        const [, , request] = endpoint("EntitiesApi_CreateEntityDocuments").mock.calls[0] as [
            unknown,
            unknown,
            EntitiesApiCreateEntityDocumentsRequest,
        ];
        const { attributes } = request.jsonApiPublisherDocumentPostOptionalIdDocument.data;
        const stored: JsonApiPublisherDocumentOutWithLinks = { id: "doc1", type: "document", attributes };
        endpoint("EntitiesApi_GetEntityDocuments").mockResolvedValue(single(stored));

        const loaded = await service.getDocument(documentRef);

        expect(loaded.period).toEqual(definition.period);
    });
});

describe("TigerWorkspacePublisherServiceV2 empty values", () => {
    it.each<[string, (service: IWorkspacePublisherServiceV2) => Promise<unknown>, string]>([
        ["createDocument", (service) => service.createDocument(absolutePeriodDocumentV2), "Create"],
        ["updateDocument", (service) => service.updateDocument(storedDocument), "Update"],
    ])("%s accepts a response with an empty description and empty tags", async (_, save, endpointVerb) => {
        endpoint(`EntitiesApi_${endpointVerb}EntityDocuments`).mockResolvedValue(
            single(documentOutV2("doc1", { description: "", tags: [] })),
        );

        await expect(save(newService())).resolves.not.toHaveProperty("description");
    });
});

interface IPagingRequest {
    page: number;
    size: number;
}

function pagedResponses(
    entity: (id: string, attributes?: { version: string }) => unknown,
): (axiosInstance: unknown, basePath: unknown, request: IPagingRequest) => Promise<unknown> {
    return (_axios, _basePath, { page, size }) => {
        if (page === 0) {
            return Promise.resolve(
                list(
                    Array.from({ length: size }, (_, i) =>
                        i === 1 ? entity("broken", { version: "3" }) : entity(`first_${i}`),
                    ),
                ),
            );
        }
        return Promise.resolve(list([entity("second_0"), entity("second_1")]));
    };
}

function refIds(entities: Array<{ ref: ObjRef }>): string[] {
    return entities.map(({ ref }) => ("identifier" in ref ? ref.identifier : ref.uri));
}

describe("TigerWorkspacePublisherServiceV2 lists", () => {
    it("drops unreadable page templates without ending the paging early", async () => {
        const getAll = endpoint("EntitiesApi_GetAllEntitiesPageTemplates");
        getAll.mockImplementation(pagedResponses(pageTemplateOutV2));

        const ids = refIds(await newService().getPageTemplates());

        const { size } = getAll.mock.calls[0]![2] as IPagingRequest;
        expect(getAll).toHaveBeenCalledTimes(2);
        expect(ids).toHaveLength(size - 1 + 2);
        expect(ids).not.toContain("broken");
        expect(ids.slice(-2)).toEqual(["second_0", "second_1"]);
    });

    it("drops unreadable document templates without ending the paging early", async () => {
        const getAll = endpoint("EntitiesApi_GetAllEntitiesDocumentTemplates");
        getAll.mockImplementation(pagedResponses(documentTemplateOutV2));

        const ids = refIds(await newService().getDocumentTemplates());

        const { size } = getAll.mock.calls[0]![2] as IPagingRequest;
        expect(getAll).toHaveBeenCalledTimes(2);
        expect(ids).toHaveLength(size - 1 + 2);
        expect(ids).not.toContain("broken");
        expect(ids.slice(-2)).toEqual(["second_0", "second_1"]);
    });

    it("keeps unreadable documents as unsupported list items", async () => {
        endpoint("EntitiesApi_GetAllEntitiesDocuments").mockResolvedValue(
            list([documentOutV2("doc1"), documentOutV2("broken", { version: "3" })]),
        );

        const items = await newService().getDocuments();

        expect(items.map((item) => item.supported)).toEqual([true, false]);
        const [, unsupported] = items;
        if (unsupported?.supported !== false) {
            throw new Error("Expected an unsupported item.");
        }
        expect(unsupported.summary.ref).toEqual(idRef("broken", "document"));
        expect(unsupported.error.details.version).toBe("3");
    });
});
