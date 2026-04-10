// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

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
});
