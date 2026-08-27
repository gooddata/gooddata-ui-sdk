// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";

import type {
    IComputedAttributeMetadataObject,
    IComputedAttributeMetadataObjectDefinition,
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { getAsCodeDescriptor } from "../asCodeRegistry.js";
import { computedAttributeDescriptor } from "../computedAttribute/computedAttributeDescriptor.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { metricDescriptor } from "../metric/metricDescriptor.js";
import { ObjectTypes } from "../objectType/constants.js";
import { parameterDescriptor } from "../parameter/parameterDescriptor.js";
import { TestPermissionsProvider } from "../permission/TestPermissionsProvider.js";

import { isLoadSeed } from "./descriptor.js";

// The editing hooks read their own runtime context (intl; a parameter's enabled types via flags).
function EditingWrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <TestPermissionsProvider>{children}</TestPermissionsProvider>
        </TestIntlProvider>
    );
}

describe("registry", () => {
    it("resolves the descriptor for each as-code type", () => {
        expect(getAsCodeDescriptor(ObjectTypes.METRIC)?.objectType).toBe(ObjectTypes.METRIC);
        expect(getAsCodeDescriptor(ObjectTypes.PARAMETER)?.objectType).toBe(ObjectTypes.PARAMETER);
        expect(getAsCodeDescriptor(ObjectTypes.COMPUTED_ATTRIBUTE)?.objectType).toBe(
            ObjectTypes.COMPUTED_ATTRIBUTE,
        );
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

    it("reconcile overlays the parsed YAML onto the base definition, keeping non-YAML fields", () => {
        const base: IMeasureMetadataObjectDefinition = {
            id: "revenue",
            type: "measure",
            title: "Original",
            description: "",
            tags: [],
            expression: "SELECT 1",
            format: "",
            metricType: "CURRENCY",
        };
        const parsed: IMeasureMetadataObjectDefinition = {
            id: "revenue",
            type: "measure",
            title: "Edited",
            description: "",
            tags: [],
            expression: "SELECT 2",
            format: "",
        };
        const { result } = renderHook(() => metricDescriptor.useEditing(), { wrapper: EditingWrapper });
        expect(result.current?.reconcile?.(base, parsed)).toMatchObject({
            id: "revenue",
            title: "Edited",
            expression: "SELECT 2",
            metricType: "CURRENCY",
        });
    });
});

describe("computedAttributeDescriptor", () => {
    it("emptyDefinition seeds a blank computed attribute with the given title and no maql", () => {
        expect(computedAttributeDescriptor.emptyDefinition("New CA")).toMatchObject({
            type: "computedAttribute",
            title: "New CA",
            expression: "",
        });
    });

    it("loads the full object for editing — the catalog item carries no MAQL", () => {
        expect(isLoadSeed(computedAttributeDescriptor.seed)).toBe(true);
    });

    it("toCopy bumps the title and preserves the non-YAML fields of the source", () => {
        const source: IComputedAttributeMetadataObject = {
            id: "rep_performance",
            uri: "rep_performance",
            ref: { identifier: "rep_performance", type: "computedAttribute" },
            type: "computedAttribute",
            title: "Rep Performance",
            description: "Band",
            tags: [],
            production: true,
            deprecated: false,
            unlisted: false,
            expression: 'SELECT CASE WHEN {metric/x} > 1 THEN "High" ELSE "Low" END',
            dataType: "STRING",
            displayForms: [],
        };
        expect(computedAttributeDescriptor.toCopy(source)).toMatchObject({
            title: "Rep Performance (2)",
            expression: 'SELECT CASE WHEN {metric/x} > 1 THEN "High" ELSE "Low" END',
            dataType: "STRING",
        });
    });

    it("reconcile overlays the parsed YAML onto the base definition, keeping non-YAML fields", () => {
        const base: IComputedAttributeMetadataObjectDefinition = {
            id: "rep_performance",
            type: "computedAttribute",
            title: "Original",
            description: "",
            tags: [],
            expression: "SELECT 1",
            dataType: "STRING",
        };
        const parsed: IComputedAttributeMetadataObjectDefinition = {
            id: "rep_performance",
            type: "computedAttribute",
            title: "Edited",
            description: "",
            tags: [],
            expression: "SELECT 2",
        };
        const { result } = renderHook(() => computedAttributeDescriptor.useEditing(), {
            wrapper: EditingWrapper,
        });
        expect(result.current?.reconcile?.(base, parsed)).toMatchObject({
            id: "rep_performance",
            title: "Edited",
            expression: "SELECT 2",
            dataType: "STRING",
        });
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
        const seed = parameterDescriptor.seed;
        if (isLoadSeed(seed)) {
            throw new Error("a parameter seeds synchronously from the catalog item");
        }
        expect(seed.editSeed(item)).toMatchObject({
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
});
