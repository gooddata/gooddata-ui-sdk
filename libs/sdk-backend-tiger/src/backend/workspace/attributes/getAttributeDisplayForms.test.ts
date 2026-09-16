// (C) 2026 GoodData Corporation

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { type JsonApiLabelOutList } from "@gooddata/api-client-tiger";
import { EntitiesApi_GetAllEntitiesLabels } from "@gooddata/api-client-tiger/endpoints/entitiesObjects";
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

describe("TigerWorkspaceAttributes.getAttributeDisplayForms — conditionalFormatting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("surfaces each label's own conditionalFormatting from the bulk read", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesLabels).mockResolvedValue(
            axiosResponse<JsonApiLabelOutList>({
                data: [
                    {
                        id: "label1",
                        type: "label",
                        attributes: {
                            title: "Region name",
                            conditionalFormatting: {
                                enabled: true,
                                conditions: [
                                    {
                                        id: "c1",
                                        operator: "EQUAL_TO",
                                        value: { kind: "literal", value: "East" },
                                        format: { scope: "cell" },
                                    },
                                ],
                            },
                        },
                        relationships: {
                            attribute: { data: { id: "attr1", type: "attribute" } },
                        },
                    },
                ],
            }),
        );

        const attributes = new TigerWorkspaceAttributes(authCall, WORKSPACE, {} as DateFormatter);
        const [label] = await attributes.getAttributeDisplayForms([idRef("label1", "displayForm")]);

        expect(label?.conditionalFormatting).toEqual({
            enabled: true,
            conditions: [
                {
                    id: "c1",
                    operator: "EQUAL_TO",
                    value: { kind: "literal", value: "East" },
                    format: { scope: "cell" },
                },
            ],
        });
    });

    it("leaves conditionalFormatting undefined when the label has none", async () => {
        vi.mocked(EntitiesApi_GetAllEntitiesLabels).mockResolvedValue(
            axiosResponse<JsonApiLabelOutList>({
                data: [
                    {
                        id: "label1",
                        type: "label",
                        attributes: { title: "Region name" },
                        relationships: { attribute: { data: { id: "attr1", type: "attribute" } } },
                    },
                ],
            }),
        );

        const attributes = new TigerWorkspaceAttributes(authCall, WORKSPACE, {} as DateFormatter);
        const [label] = await attributes.getAttributeDisplayForms([idRef("label1", "displayForm")]);

        expect(label?.conditionalFormatting).toBeUndefined();
    });
});
