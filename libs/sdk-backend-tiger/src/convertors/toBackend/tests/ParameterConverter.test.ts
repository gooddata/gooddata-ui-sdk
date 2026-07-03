// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { JsonApiParameterOutWithLinks } from "@gooddata/api-client-tiger";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { convertParameter } from "../../fromBackend/ParameterConverter.js";
import { convertParameterToBackendCreate, convertParameterToBackendUpdate } from "../ParameterConverter.js";

describe("convertParameterToBackendCreate", () => {
    it("should convert parameter definition for create requests", () => {
        const parameter: IParameterMetadataObjectDefinition = {
            type: "parameter",
            id: "threshold",
            title: "Threshold",
            description: "Alert threshold",
            tags: ["alerts"],
            definition: {
                type: "NUMBER",
                defaultValue: 10,
                constraints: {
                    min: 0,
                    max: 100,
                },
            },
        };

        expect(convertParameterToBackendCreate(parameter)).toEqual({
            title: "Threshold",
            description: "Alert threshold",
            tags: ["alerts"],
            definition: {
                type: "NUMBER",
                defaultValue: 10,
                constraints: {
                    min: 0,
                    max: 100,
                },
            },
        });
    });

    it("should convert a STRING definition for create requests", () => {
        const parameter: IParameterMetadataObjectDefinition = {
            type: "parameter",
            id: "scenario",
            title: "Scenario",
            description: "What-if scenario",
            tags: ["whatif"],
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1, maxLength: 50 },
            },
        };

        expect(convertParameterToBackendCreate(parameter)).toEqual({
            title: "Scenario",
            description: "What-if scenario",
            tags: ["whatif"],
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1, maxLength: 50 },
            },
        });
    });
});

describe("convertParameterToBackendUpdate", () => {
    it("should include only provided fields for update requests", () => {
        expect(
            convertParameterToBackendUpdate({
                title: "Updated threshold",
                definition: {
                    type: "NUMBER",
                    defaultValue: 5,
                },
            }),
        ).toEqual({
            title: "Updated threshold",
            definition: {
                type: "NUMBER",
                defaultValue: 5,
            },
        });
    });

    it("should convert a STRING definition for update requests", () => {
        expect(
            convertParameterToBackendUpdate({
                definition: {
                    type: "STRING",
                    defaultValue: "Actual",
                    constraints: { minLength: 1, maxLength: 50 },
                },
            }),
        ).toEqual({
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1, maxLength: 50 },
            },
        });
    });
});

describe("STRING parameter round-trip", () => {
    it("preserves a STRING definition through toBackend create then fromBackend", () => {
        const model: IParameterMetadataObjectDefinition = {
            type: "parameter",
            id: "scenario",
            title: "Scenario",
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1, maxLength: 50 },
            },
        };

        const backendCreate = convertParameterToBackendCreate(model);
        const out: JsonApiParameterOutWithLinks = {
            id: "scenario",
            type: "parameter",
            attributes: { title: backendCreate.title, definition: backendCreate.definition },
            links: { self: "/api/v1/entities/workspaces/demo/parameters/scenario" },
        };

        expect(convertParameter(out).definition).toEqual(model.definition);
    });
});
