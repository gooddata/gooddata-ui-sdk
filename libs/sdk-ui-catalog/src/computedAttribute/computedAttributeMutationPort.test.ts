// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type {
    IComputedAttributeMetadataObject,
    IComputedAttributeMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import type { ICatalogItemComputedAttribute } from "../catalogItem/types.js";

import {
    createComputedAttributeMutationAdapter,
    listComputedAttributeReferences,
} from "./computedAttributeMutationPort.js";

const MAQL = 'SELECT CASE WHEN {metric/won_activities} > 50 THEN "High" ELSE "Low" END';

const computedAttributeItem = {
    identifier: "rep_performance",
    type: "computedAttribute",
} as ICatalogItemComputedAttribute;

const saved: IComputedAttributeMetadataObject = {
    id: "rep_performance",
    uri: "rep_performance",
    ref: { identifier: "rep_performance", type: "computedAttribute" },
    type: "computedAttribute",
    title: "Rep Performance",
    description: "Band",
    tags: ["sales"],
    production: true,
    deprecated: false,
    unlisted: false,
    created: "2024-01-01",
    updated: "2024-01-02",
    expression: MAQL,
    displayForms: [],
};

function createFakeBackend() {
    const createComputedAttribute = vi.fn().mockResolvedValue(saved);
    const updateComputedAttribute = vi.fn().mockResolvedValue(saved);
    const deleteComputedAttribute = vi.fn().mockResolvedValue(undefined);
    const getComputedAttribute = vi.fn().mockResolvedValue(saved);
    const getComputedAttributeReferencingObjects = vi.fn().mockResolvedValue({ measures: [] });
    const backend = {
        workspace: () => ({
            computedAttributes: () => ({
                createComputedAttribute,
                updateComputedAttribute,
                deleteComputedAttribute,
                getComputedAttribute,
                getComputedAttributeReferencingObjects,
            }),
        }),
    } as unknown as IAnalyticalBackend;
    return {
        backend,
        createComputedAttribute,
        updateComputedAttribute,
        deleteComputedAttribute,
        getComputedAttributeReferencingObjects,
    };
}

describe("computedAttributeMutationPort adapter", () => {
    it("create calls the backend and converts the result to a catalog item", async () => {
        const { backend, createComputedAttribute } = createFakeBackend();
        const adapter = createComputedAttributeMutationAdapter(backend, "ws-1");

        const result = await adapter.create({
            type: "computedAttribute",
            title: "Rep Performance",
            description: "Band",
            tags: ["sales"],
            expression: MAQL,
        });

        expect(createComputedAttribute).toHaveBeenCalledWith(expect.objectContaining({ expression: MAQL }));
        expect(result).toMatchObject({ type: "computedAttribute", identifier: "rep_performance" });
    });

    it("update persists the definition's content with the loaded object's identity", async () => {
        const { backend, updateComputedAttribute } = createFakeBackend();
        const adapter = createComputedAttributeMutationAdapter(backend, "ws-1");

        await adapter.update(saved, {
            type: "computedAttribute",
            title: "Renamed",
            description: "Updated",
            tags: ["updated"],
            expression: "SELECT 2",
            dataType: "STRING",
        });

        expect(updateComputedAttribute).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "computedAttribute",
                id: "rep_performance",
                ref: { identifier: "rep_performance", type: "computedAttribute" },
                title: "Renamed",
                expression: "SELECT 2",
                dataType: "STRING",
            }),
        );
    });

    it("update keeps the loaded identity even when the definition carries a different id", async () => {
        const { backend, updateComputedAttribute } = createFakeBackend();
        const adapter = createComputedAttributeMutationAdapter(backend, "ws-1");

        await adapter.update(saved, {
            type: "computedAttribute",
            id: "some_other_id",
            title: "X",
            description: "",
            tags: [],
            expression: "SELECT 1",
        });

        expect(updateComputedAttribute).toHaveBeenCalledWith(
            expect.objectContaining({ id: "rep_performance", ref: saved.ref, uri: saved.uri }),
        );
    });

    it("update carries the base's audit metadata the definition shape cannot hold", async () => {
        const { backend, updateComputedAttribute } = createFakeBackend();
        const adapter = createComputedAttributeMutationAdapter(backend, "ws-1");

        await adapter.update(saved, {
            type: "computedAttribute",
            title: "Rep Performance",
            description: "Band",
            tags: ["sales"],
            expression: MAQL,
        });

        expect(updateComputedAttribute).toHaveBeenCalledWith(
            expect.objectContaining({ created: "2024-01-01", updated: "2024-01-02" }),
        );
    });

    it("update rejects a bare definition as base — it lacks the server-managed identity", async () => {
        const { backend } = createFakeBackend();
        const adapter = createComputedAttributeMutationAdapter(backend, "ws-1");
        const bare: IComputedAttributeMetadataObjectDefinition = {
            type: "computedAttribute",
            title: "X",
            description: "",
            tags: [],
            expression: "SELECT 1",
        };

        await expect(adapter.update(bare, bare)).rejects.toThrow(/requires the loaded object/);
    });

    it("delete targets the computed attribute by its own ref type", async () => {
        const { backend, deleteComputedAttribute } = createFakeBackend();
        const adapter = createComputedAttributeMutationAdapter(backend, "ws-1");

        await adapter.delete({ identifier: "rep_performance", type: "computedAttribute" });

        expect(deleteComputedAttribute).toHaveBeenCalledWith({
            identifier: "rep_performance",
            type: "computedAttribute",
        });
    });
});

describe("computed attribute references", () => {
    it("titles the referencing insights, metrics, and dashboards", async () => {
        const { backend, getComputedAttributeReferencingObjects } = createFakeBackend();
        getComputedAttributeReferencingObjects.mockResolvedValueOnce({
            insights: [{ insight: { title: "Rep performance" } }, { insight: { title: "Won by band" } }],
            measures: [{ title: "Metric ABC" }],
            analyticalDashboards: [{ title: "Sales overview" }],
        });

        expect(await listComputedAttributeReferences(backend, "ws-1", computedAttributeItem)).toEqual([
            "Rep performance",
            "Won by band",
            "Metric ABC",
            "Sales overview",
        ]);
    });

    it("reports nothing when the response carries neither array", async () => {
        const { backend, getComputedAttributeReferencingObjects } = createFakeBackend();
        getComputedAttributeReferencingObjects.mockResolvedValueOnce({});

        expect(await listComputedAttributeReferences(backend, "ws-1", computedAttributeItem)).toEqual([]);
    });
});
