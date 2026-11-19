// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    DateRangeParameterValue,
    JsonApiParameterOutWithLinks,
    JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";

import { convertParameter } from "./ParameterConverter.js";

describe("convertParameter", () => {
    it("should convert parameter metadata including definition and audit data", () => {
        const parameter: JsonApiParameterOutWithLinks = {
            id: "threshold",
            type: "parameter",
            attributes: {
                title: "Threshold",
                description: "Alert threshold",
                tags: ["alerts"],
                areRelationsValid: true,
                definition: {
                    type: "NUMBER",
                    defaultValue: 10,
                    constraints: {
                        min: 0,
                        max: 100,
                    },
                },
                createdAt: "2024-01-01 10:00",
                modifiedAt: "2024-01-02 10:00",
            },
            meta: {
                origin: {
                    originType: "PARENT",
                    originId: "parentWs",
                },
            },
            relationships: {
                createdBy: {
                    data: {
                        id: "creator",
                        type: "userIdentifier",
                    },
                },
                modifiedBy: {
                    data: {
                        id: "modifier",
                        type: "userIdentifier",
                    },
                },
            },
            links: {
                self: "/api/v1/entities/workspaces/demo/parameters/threshold",
            },
        };

        const included: JsonApiUserIdentifierOutWithLinks[] = [
            {
                id: "creator",
                type: "userIdentifier",
                attributes: {
                    firstname: "Jane",
                    lastname: "Doe",
                    email: "jane@example.com",
                },
                links: {
                    self: "/users/creator",
                },
            },
            {
                id: "modifier",
                type: "userIdentifier",
                attributes: {
                    firstname: "John",
                    lastname: "Smith",
                    email: "john@example.com",
                },
                links: {
                    self: "/users/modifier",
                },
            },
        ];

        const result = convertParameter(parameter, included);

        expect(result.type).toBe("parameter");
        expect(result.ref).toEqual({ identifier: "threshold", type: "parameter" });
        expect(result.definition).toEqual({
            type: "NUMBER",
            defaultValue: 10,
            constraints: {
                min: 0,
                max: 100,
            },
        });
        expect(result.areRelationsValid).toBe(true);
        expect(result.isLocked).toBe(true);
        expect(result.createdBy?.firstName).toBe("Jane");
        expect(result.updatedBy?.lastName).toBe("Smith");
    });

    it("should convert a STRING parameter definition without throwing", () => {
        const parameter: JsonApiParameterOutWithLinks = {
            id: "scenario",
            type: "parameter",
            attributes: {
                title: "Scenario",
                definition: {
                    type: "STRING",
                    defaultValue: "Actual",
                    constraints: {
                        minLength: 1,
                        maxLength: 50,
                    },
                },
            },
            links: {
                self: "/api/v1/entities/workspaces/demo/parameters/scenario",
            },
        };

        const result = convertParameter(parameter);

        expect(result.definition).toEqual({
            type: "STRING",
            defaultValue: "Actual",
            constraints: {
                minLength: 1,
                maxLength: 50,
            },
        });
    });

    it("should carry allowedValues in original order for a STRING parameter", () => {
        const parameter: JsonApiParameterOutWithLinks = {
            id: "scenario",
            type: "parameter",
            attributes: {
                title: "Scenario",
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
            },
            links: {
                self: "/api/v1/entities/workspaces/demo/parameters/scenario",
            },
        };

        const result = convertParameter(parameter);

        expect(result.definition).toEqual({
            type: "STRING",
            defaultValue: "Actual",
            constraints: {
                allowedValues: [
                    { value: "Actual", title: "Actual results" },
                    { value: "Plan" },
                    { value: "Forecast", title: "Forecast scenario" },
                ],
            },
        });
    });

    it("should omit an empty allowedValues list for a STRING parameter", () => {
        const parameter: JsonApiParameterOutWithLinks = {
            id: "scenario",
            type: "parameter",
            attributes: {
                title: "Scenario",
                definition: {
                    type: "STRING",
                    defaultValue: "Actual",
                    constraints: { minLength: 1, allowedValues: [] },
                },
            },
            links: {
                self: "/api/v1/entities/workspaces/demo/parameters/scenario",
            },
        };

        const result = convertParameter(parameter);

        expect(result.definition).toEqual({
            type: "STRING",
            defaultValue: "Actual",
            constraints: { minLength: 1 },
        });
        expect(result.definition).not.toHaveProperty("constraints.allowedValues");
    });

    function dateRangeParameter(defaultValue: DateRangeParameterValue): JsonApiParameterOutWithLinks {
        return {
            id: "lastHoldingMonth",
            type: "parameter",
            attributes: {
                title: "Last holding month",
                definition: { type: "DATE_RANGE", defaultValue },
            },
            links: {
                self: "/api/v1/entities/workspaces/demo/parameters/lastHoldingMonth",
            },
        };
    }

    it("should convert a DATE_RANGE parameter definition", () => {
        const result = convertParameter(
            dateRangeParameter({ granularity: "MONTH", from: "2025-08", to: "2026-08" }),
        );

        expect(result.definition).toEqual({
            type: "DATE_RANGE",
            defaultValue: { granularity: "GDC.time.month", from: "2025-08", to: "2026-08" },
        });
    });

    it.each([
        ["YEAR", "GDC.time.year"],
        ["QUARTER", "GDC.time.quarter"],
        ["MONTH", "GDC.time.month"],
        ["WEEK", "GDC.time.week"],
        ["DAY", "GDC.time.date"],
        ["HOUR", "GDC.time.hour"],
        ["MINUTE", "GDC.time.minute"],
        ["SECOND", "GDC.time.second"],
    ] as const)("should convert the %s period granularity to %s", (granularity, expected) => {
        expect(convertParameter(dateRangeParameter({ granularity })).definition).toEqual({
            type: "DATE_RANGE",
            defaultValue: { granularity: expected },
        });
    });

    it("should keep an open end of a DATE_RANGE period absent", () => {
        const result = convertParameter(dateRangeParameter({ granularity: "HOUR", to: "2026-08-14 09" }));

        expect(result.definition).toEqual({
            type: "DATE_RANGE",
            defaultValue: { granularity: "GDC.time.hour", to: "2026-08-14 09" },
        });
        expect(result.definition).not.toHaveProperty("defaultValue.from");
    });

    it("should keep a DATE_RANGE period without either end", () => {
        expect(convertParameter(dateRangeParameter({ granularity: "DAY" })).definition).toEqual({
            type: "DATE_RANGE",
            defaultValue: { granularity: "GDC.time.date" },
        });
    });
});
