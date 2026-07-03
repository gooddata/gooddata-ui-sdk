// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type {
    JsonApiParameterOutWithLinks,
    JsonApiUserIdentifierOutWithLinks,
} from "@gooddata/api-client-tiger";

import { convertParameter } from "../ParameterConverter.js";

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
});
