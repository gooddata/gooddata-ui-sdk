// (C) 2026 GoodData Corporation

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiLabelOutDocument } from "@gooddata/api-client-tiger";
import { EntitiesApi_PatchEntityLabels } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
import { idRef } from "@gooddata/sdk-model";

import { type DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";
import { axiosResponse } from "../../../utils/axiosResponse.test.helpers.js";

import { type TigerWorkspaceAttributes as TigerWorkspaceAttributesClass } from "./index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/entitiesObjects", () => ({
    EntitiesApi_GetAllEntitiesAttributes: vi.fn(),
    EntitiesApi_GetAllEntitiesLabels: vi.fn(),
    EntitiesApi_GetEntityAttributes: vi.fn(),
    EntitiesApi_PatchEntityAttributes: vi.fn(),
    EntitiesApi_PatchEntityLabels: vi.fn(),
}));

// The service is imported dynamically from a fresh module registry so that it picks up the mock
// above even when another (non-isolated) test file already imported it without it.
let TigerWorkspaceAttributes: typeof TigerWorkspaceAttributesClass;

beforeAll(async () => {
    vi.resetModules();
    ({ TigerWorkspaceAttributes } = await import("./index.js"));
});

const WORKSPACE = "ws-1";

const authCall = vi.fn(async (callback) =>
    callback({
        axios: {},
        basePath: "",
    }),
) as TigerAuthenticatedCallGuard;

function patchResponse() {
    return axiosResponse<JsonApiLabelOutDocument>({
        data: {
            id: "label1",
            type: "label",
            attributes: {
                title: "Region name",
                primary: true,
            },
            relationships: {
                attribute: { data: { id: "attr1", type: "attribute" } },
            },
        },
    });
}

function newAttributes() {
    return new TigerWorkspaceAttributes(authCall, WORKSPACE, {} as DateFormatter);
}

describe("TigerWorkspaceAttributes.updateAttributeDisplayFormMeta — conditionalFormatting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(EntitiesApi_PatchEntityLabels).mockResolvedValue(patchResponse());
    });

    it("serializes the caller's conditionalFormatting fresh, without fetching the backend's current state first", async () => {
        const attributes = newAttributes();

        await attributes.updateAttributeDisplayFormMeta({
            ref: idRef("label1"),
            id: "label1",
            uri: "/label1",
            conditionalFormatting: {
                enabled: true,
                conditions: [
                    {
                        id: "c1",
                        operator: "GREATER_THAN",
                        value: { kind: "literal", value: 100 },
                        format: { scope: "cell", backgroundColor: "#E54D40" },
                    },
                ],
            },
        });

        const request = vi.mocked(EntitiesApi_PatchEntityLabels).mock.calls[0][2];
        expect(request.jsonApiLabelPatchDocument.data.attributes?.conditionalFormatting).toEqual({
            enabled: true,
            conditions: [
                {
                    id: "c1",
                    operator: "GREATER_THAN",
                    value: { kind: "literal", value: 100 },
                    format: { scope: "cell", backgroundColor: "#E54D40" },
                },
            ],
        });
    });

    it("clears conditionalFormatting via explicit null, without fetching the current state", async () => {
        const attributes = newAttributes();

        await attributes.updateAttributeDisplayFormMeta({
            ref: idRef("label1"),
            id: "label1",
            uri: "/label1",
            conditionalFormatting: null,
        });

        const request = vi.mocked(EntitiesApi_PatchEntityLabels).mock.calls[0][2];
        expect(request.jsonApiLabelPatchDocument.data.attributes?.conditionalFormatting).toBeNull();
    });

    it("sends an empty conditions list as-is", async () => {
        const attributes = newAttributes();

        await attributes.updateAttributeDisplayFormMeta({
            ref: idRef("label1"),
            id: "label1",
            uri: "/label1",
            conditionalFormatting: { enabled: true, conditions: [] },
        });

        const request = vi.mocked(EntitiesApi_PatchEntityLabels).mock.calls[0][2];
        expect(request.jsonApiLabelPatchDocument.data.attributes?.conditionalFormatting).toEqual({
            enabled: true,
            conditions: [],
        });
    });

    it("does not touch conditionalFormatting (nor fetch the current state) when the caller omits it entirely", async () => {
        const attributes = newAttributes();

        await attributes.updateAttributeDisplayFormMeta({
            ref: idRef("label1"),
            id: "label1",
            uri: "/label1",
        });

        const request = vi.mocked(EntitiesApi_PatchEntityLabels).mock.calls[0][2];
        expect(request.jsonApiLabelPatchDocument.data.attributes).not.toHaveProperty("conditionalFormatting");
    });

    it("forwards title, description, and tags alongside conditionalFormatting, not just conditionalFormatting", async () => {
        const attributes = newAttributes();

        await attributes.updateAttributeDisplayFormMeta({
            ref: idRef("label1"),
            id: "label1",
            uri: "/label1",
            title: "New label title",
            description: "New description",
            tags: ["tag1"],
        });

        const request = vi.mocked(EntitiesApi_PatchEntityLabels).mock.calls[0][2];
        expect(request.jsonApiLabelPatchDocument.data.attributes).toMatchObject({
            title: "New label title",
            description: "New description",
            tags: ["tag1"],
        });
    });

    it("converts the patch response into an IAttributeDisplayFormMetadataObject, preserving the attribute relationship", async () => {
        const attributes = newAttributes();

        const result = await attributes.updateAttributeDisplayFormMeta({
            ref: idRef("label1"),
            id: "label1",
            uri: "/label1",
            title: "New label title",
        });

        expect(result.id).toBe("label1");
        expect(result.attribute).toEqual(idRef("attr1", "attribute"));
        expect(result.isPrimary).toBe(true);
    });
});
