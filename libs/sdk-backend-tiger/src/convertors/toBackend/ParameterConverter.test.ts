// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { JsonApiParameterOutWithLinks } from "@gooddata/api-client-tiger";
import type { IDateRangeParameterDefinition, IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import { convertParameter } from "../fromBackend/ParameterConverter.js";

import { convertParameterToBackendCreate, convertParameterToBackendUpdate } from "./ParameterConverter.js";

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

    it("should carry allowedValues with titles in original order for create requests", () => {
        const parameter: IParameterMetadataObjectDefinition = {
            type: "parameter",
            id: "scenario",
            title: "Scenario",
            description: "What-if scenario",
            tags: ["whatif"],
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: {
                    allowedValues: [
                        { value: "Actual", title: "Actual results" },
                        { value: "Plan" },
                        { value: "Forecast", title: "Forecast scenario" },
                    ],
                },
            },
        };

        expect(convertParameterToBackendCreate(parameter)).toEqual({
            title: "Scenario",
            description: "What-if scenario",
            tags: ["whatif"],
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: {
                    allowedValues: [
                        { value: "Actual", title: "Actual results" },
                        { value: "Plan" },
                        { value: "Forecast", title: "Forecast scenario" },
                    ],
                },
            },
        });
    });

    it("should omit an empty allowedValues list for create requests", () => {
        const parameter: IParameterMetadataObjectDefinition = {
            type: "parameter",
            id: "scenario",
            title: "Scenario",
            description: "What-if scenario",
            tags: ["whatif"],
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1, allowedValues: [] },
            },
        };

        expect(convertParameterToBackendCreate(parameter)).toEqual({
            title: "Scenario",
            description: "What-if scenario",
            tags: ["whatif"],
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1 },
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

    it("should carry allowedValues in original order for update requests", () => {
        expect(
            convertParameterToBackendUpdate({
                definition: {
                    type: "STRING",
                    defaultValue: "Actual",
                    constraints: {
                        allowedValues: [{ value: "Actual", title: "Actual results" }, { value: "Plan" }],
                    },
                },
            }),
        ).toEqual({
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: {
                    allowedValues: [{ value: "Actual", title: "Actual results" }, { value: "Plan" }],
                },
            },
        });
    });
});

describe("DATE_RANGE parameter", () => {
    const model: IParameterMetadataObjectDefinition = {
        type: "parameter",
        id: "lastHoldingMonth",
        title: "Last holding month",
        definition: {
            type: "DATE_RANGE",
            defaultValue: { granularity: "GDC.time.month", from: "2025-08", to: "2026-08" },
        },
    };

    it("sends the period for create and update requests", () => {
        const backendDefinition = {
            type: "DATE_RANGE",
            defaultValue: { granularity: "MONTH", from: "2025-08", to: "2026-08" },
        };

        expect(convertParameterToBackendCreate(model).definition).toEqual(backendDefinition);
        expect(convertParameterToBackendUpdate({ definition: model.definition }).definition).toEqual(
            backendDefinition,
        );
    });

    it.each([
        "GDC.time.year",
        "GDC.time.quarter",
        "GDC.time.month",
        "GDC.time.week",
        "GDC.time.date",
        "GDC.time.hour",
        "GDC.time.minute",
        "GDC.time.second",
    ] as const)("preserves a %s period through toBackend create then fromBackend", (granularity) => {
        const definition: IDateRangeParameterDefinition = {
            type: "DATE_RANGE",
            defaultValue: { granularity },
        };
        const backendCreate = convertParameterToBackendCreate({ ...model, definition });
        const out: JsonApiParameterOutWithLinks = {
            id: "lastHoldingMonth",
            type: "parameter",
            attributes: { title: backendCreate.title, definition: backendCreate.definition },
            links: { self: "/api/v1/entities/workspaces/demo/parameters/lastHoldingMonth" },
        };

        expect(convertParameter(out).definition).toEqual(definition);
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

    it("preserves a STRING definition with allowedValues through the full round-trip", () => {
        const model: IParameterMetadataObjectDefinition = {
            type: "parameter",
            id: "scenario",
            title: "Scenario",
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: {
                    minLength: 1,
                    maxLength: 50,
                    allowedValues: [
                        { value: "Actual", title: "Actual results" },
                        { value: "Plan" },
                        { value: "Forecast", title: "Forecast scenario" },
                    ],
                },
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

    it("normalizes an empty allowedValues list to absent through the full round-trip", () => {
        const model: IParameterMetadataObjectDefinition = {
            type: "parameter",
            id: "scenario",
            title: "Scenario",
            definition: {
                type: "STRING",
                defaultValue: "Actual",
                constraints: { minLength: 1, maxLength: 50, allowedValues: [] },
            },
        };

        const backendCreate = convertParameterToBackendCreate(model);
        const out: JsonApiParameterOutWithLinks = {
            id: "scenario",
            type: "parameter",
            attributes: { title: backendCreate.title, definition: backendCreate.definition },
            links: { self: "/api/v1/entities/workspaces/demo/parameters/scenario" },
        };

        expect(convertParameter(out).definition).toEqual({
            type: "STRING",
            defaultValue: "Actual",
            constraints: { minLength: 1, maxLength: 50 },
        });
    });
});
