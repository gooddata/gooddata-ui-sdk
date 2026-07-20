// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IMeasureMetadataObject, IMeasureMetadataObjectDefinition } from "@gooddata/sdk-model";

import { getAsCodeDescriptor } from "../../asCodeRegistry.js";
import { metricDescriptor } from "../../metric/metricDescriptor.js";
import { ObjectTypes } from "../../objectType/constants.js";
import { parameterDescriptor } from "../../parameter/parameterDescriptor.js";

describe("registry", () => {
    it("resolves the descriptor for each as-code type", () => {
        expect(getAsCodeDescriptor(ObjectTypes.METRIC)?.objectType).toBe(ObjectTypes.METRIC);
        expect(getAsCodeDescriptor(ObjectTypes.PARAMETER)?.objectType).toBe(ObjectTypes.PARAMETER);
    });

    it("returns undefined for a type that is not editable as code", () => {
        expect(getAsCodeDescriptor(ObjectTypes.DASHBOARD)).toBeUndefined();
    });
});

describe("metricDescriptor", () => {
    it("emptyDefinition seeds a blank measure with the given title and a SELECT 1 expression", () => {
        expect(metricDescriptor.emptyDefinition("New Metric")).toMatchObject({
            type: "measure",
            title: "New Metric",
            expression: "SELECT 1",
        });
    });

    it("toCopy bumps the title and preserves the non-YAML fields of the source measure", () => {
        const source: IMeasureMetadataObject = {
            id: "revenue.total",
            uri: "revenue.total",
            ref: { identifier: "revenue.total", type: "measure" },
            type: "measure",
            title: "Total Revenue",
            description: "Sum",
            tags: [],
            production: true,
            deprecated: false,
            unlisted: false,
            expression: "SELECT SUM({fact/x})",
            format: "#,##0",
            metricType: "CURRENCY",
        };
        expect(metricDescriptor.toCopy(source)).toMatchObject({
            title: "Total Revenue (2)",
            expression: "SELECT SUM({fact/x})",
            metricType: "CURRENCY",
        });
    });

    it("applyYamlEdits overlays the parsed YAML onto the full definition, keeping non-YAML fields", () => {
        const full = {
            id: "revenue",
            type: "measure",
            title: "Original",
            expression: "SELECT 1",
            format: "",
            metricType: "CURRENCY",
        } as IMeasureMetadataObjectDefinition;
        const parsed = {
            id: "revenue",
            type: "measure",
            title: "Edited",
            expression: "SELECT 2",
            format: "",
        } as IMeasureMetadataObjectDefinition;
        expect(metricDescriptor.applyYamlEdits!(full, parsed)).toMatchObject({
            id: "revenue",
            title: "Edited",
            expression: "SELECT 2",
            metricType: "CURRENCY",
        });
    });

    it("declares the metric-only capabilities: applyYamlEdits, an open action, and a fetching port", () => {
        expect(metricDescriptor.applyYamlEdits).toBeTypeOf("function");
        expect(metricDescriptor.openAction).toBeDefined();
        // A metric fetches its full measure, so it seeds via port.load rather than a sync editSeed.
        expect(metricDescriptor.editSeed).toBeUndefined();
    });
});

describe("parameterDescriptor", () => {
    const paramDefinition = {
        id: "param.id",
        type: "parameter" as const,
        title: "My Param",
        description: "desc",
        tags: [],
        definition: { type: "NUMBER" as const, defaultValue: 5 },
    };

    it("emptyDefinition seeds a blank NUMBER parameter with the given title", () => {
        expect(parameterDescriptor.emptyDefinition("New Param")).toEqual({
            type: "parameter",
            title: "New Param",
            description: "",
            definition: { type: "NUMBER", defaultValue: 0 },
        });
    });

    it("editSeed maps the catalog item straight to a definition", () => {
        const item = {
            identifier: "param.id",
            type: "parameter" as const,
            title: "My Param",
            description: "desc",
            tags: [],
            createdBy: "u",
            updatedBy: "u",
            createdAt: null,
            updatedAt: null,
            isLocked: false,
            isEditable: true,
            definition: { type: "NUMBER" as const, defaultValue: 5 },
        };
        expect(parameterDescriptor.editSeed!(item)).toMatchObject({
            id: "param.id",
            type: "parameter",
            title: "My Param",
            definition: { type: "NUMBER", defaultValue: 5 },
        });
    });

    it("toCopy bumps the title and keeps the definition", () => {
        expect(parameterDescriptor.toCopy(paramDefinition)).toMatchObject({
            title: "My Param (2)",
            definition: { type: "NUMBER", defaultValue: 5 },
        });
    });

    it("declares no applyYamlEdits or open action (its YAML round-trips 1:1, no standalone editor)", () => {
        expect(parameterDescriptor.applyYamlEdits).toBeUndefined();
        expect(parameterDescriptor.openAction).toBeUndefined();
    });
});
