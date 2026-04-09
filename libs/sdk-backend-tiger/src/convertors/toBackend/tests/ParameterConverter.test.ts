// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { convertParameterToBackend } from "../ParameterConverter.js";

describe("convertParameterToBackend", () => {
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

        expect(convertParameterToBackend(parameter)).toEqual({
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
