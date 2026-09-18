// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObject, IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";

import type { ICatalogItemParameter } from "../catalogItem/types.js";

import { createParameterMutationAdapter, listParameterReferences } from "./parameterMutationPort.js";
import { createTestParameterMutationPort } from "./parameterMutationPort.test.utils.js";

const savedParameter: IParameterMetadataObject = {
    id: "param.id",
    uri: "/gdc/md/param.id",
    ref: { identifier: "param.id", type: "parameter" },
    type: "parameter",
    title: "My Param",
    description: "Description",
    tags: [],
    production: true,
    deprecated: false,
    unlisted: false,
    created: "2024-01-01",
    updated: "2024-01-02",
    definition: { type: "NUMBER", defaultValue: 10 },
};

function createFakeBackend(
    overrides: {
        createParameter?: ReturnType<typeof vi.fn>;
        updateParameter?: ReturnType<typeof vi.fn>;
        deleteParameter?: ReturnType<typeof vi.fn>;
        getReferences?: ReturnType<typeof vi.fn>;
    } = {},
) {
    const createParameter = overrides.createParameter ?? vi.fn().mockResolvedValue(savedParameter);
    const updateParameter = overrides.updateParameter ?? vi.fn().mockResolvedValue(savedParameter);
    const deleteParameter = overrides.deleteParameter ?? vi.fn().mockResolvedValue(undefined);
    const getReferences = overrides.getReferences ?? vi.fn().mockResolvedValue({ nodes: [], edges: [] });
    const backend = {
        workspace: () => ({
            parameters: () => ({
                createParameter,
                updateParameter,
                deleteParameter,
            }),
            references: () => ({
                getReferences,
            }),
        }),
    } as unknown as IAnalyticalBackend;
    return { backend, createParameter, updateParameter, deleteParameter, getReferences };
}

describe("parameterMutationPort adapter", () => {
    describe("create", () => {
        it("calls backend createParameter and returns the converted catalog item", async () => {
            const { backend, createParameter } = createFakeBackend();

            const adapter = createParameterMutationAdapter(backend, "ws-1");
            const result = await adapter.create({
                type: "parameter",
                title: "My Param",
                description: "Description",
                definition: { type: "NUMBER", defaultValue: 10 },
            });

            expect(createParameter).toHaveBeenCalledWith({
                type: "parameter",
                title: "My Param",
                description: "Description",
                definition: { type: "NUMBER", defaultValue: 10 },
            });
            expect(result).toMatchObject({
                type: "parameter",
                identifier: "param.id",
                title: "My Param",
                description: "Description",
                definition: { type: "NUMBER", defaultValue: 10 },
            });
        });
    });

    describe("createTestParameterMutationPort", () => {
        it("returns a port with vi.fn() stubs for all three methods", async () => {
            const port = createTestParameterMutationPort();

            expect(vi.isMockFunction(port.create)).toBe(true);
            expect(vi.isMockFunction(port.update)).toBe(true);
            expect(vi.isMockFunction(port.delete)).toBe(true);

            const created = await port.create({
                type: "parameter",
                title: "New",
                description: "",
                definition: { type: "NUMBER", defaultValue: 1 },
            });
            expect(created).toMatchObject({ type: "parameter" });
        });

        it("applies overrides", async () => {
            const deleteFn = vi.fn().mockResolvedValue(undefined);
            const port = createTestParameterMutationPort({ delete: deleteFn });
            await port.delete({ identifier: "x", type: "parameter" });
            expect(deleteFn).toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("calls backend deleteParameter", async () => {
            const { backend, deleteParameter } = createFakeBackend();

            const adapter = createParameterMutationAdapter(backend, "ws-1");
            await adapter.delete({ identifier: "param.id", type: "parameter" });

            expect(deleteParameter).toHaveBeenCalledWith(
                expect.objectContaining({ identifier: "param.id", type: "parameter" }),
            );
        });
    });

    describe("update", () => {
        // The base is what the editor started from (the descriptor's `editSeed` — a definition carrying
        // the item's identity), not the catalog item.
        const baseDefinition: IParameterMetadataObjectDefinition = {
            id: "param.id",
            type: "parameter",
            title: "My Param",
            description: "Description",
            tags: [],
            definition: { type: "NUMBER", defaultValue: 10 },
        };

        it("persists the parsed definition (its 1:1 round-trip is the complete new state)", async () => {
            const { backend, updateParameter } = createFakeBackend();

            const adapter = createParameterMutationAdapter(backend, "ws-1");
            const result = await adapter.update(baseDefinition, {
                id: "param.id",
                type: "parameter",
                title: "Renamed",
                description: "Updated",
                tags: ["changed"],
                definition: { type: "NUMBER", defaultValue: 42 },
            });

            expect(updateParameter).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "param.id",
                    title: "Renamed",
                    description: "Updated",
                    tags: ["changed"],
                    definition: { type: "NUMBER", defaultValue: 42 },
                }),
            );
            expect(result).toMatchObject({
                type: "parameter",
                identifier: "param.id",
            });
        });

        it("pins the identity to the base, ignoring a divergent id in the parsed definition", async () => {
            const { backend, updateParameter } = createFakeBackend();

            const adapter = createParameterMutationAdapter(backend, "ws-1");
            await expect(
                adapter.update(baseDefinition, {
                    id: "some.other.param",
                    type: "parameter",
                    title: "Renamed",
                    description: "",
                    tags: [],
                    definition: { type: "NUMBER", defaultValue: 42 },
                }),
            ).rejects.toThrow(/identity/);
            expect(updateParameter).not.toHaveBeenCalled();
        });

        it("rejects when the base has no identity", async () => {
            const { backend } = createFakeBackend();
            const { id: _id, ...baseWithoutIdentity } = baseDefinition;

            const adapter = createParameterMutationAdapter(backend, "ws-1");
            await expect(
                adapter.update(baseWithoutIdentity, {
                    id: "param.id",
                    type: "parameter",
                    title: "Renamed",
                    description: "",
                    tags: [],
                    definition: { type: "NUMBER", defaultValue: 42 },
                }),
            ).rejects.toThrow(/identity/);
        });
    });
});

describe("parameter references", () => {
    const parameterItem = { identifier: "param.id", type: "parameter" } as ICatalogItemParameter;

    it("listParameterReferences titles every dependent node and skips the root", async () => {
        const { backend, getReferences } = createFakeBackend();
        getReferences.mockResolvedValueOnce({
            nodes: [
                { identifier: "param.id", type: "parameter", title: "My Param", isRoot: true },
                { identifier: "ca.rep", type: "computedAttribute", title: "Rep performance" },
                { identifier: "revenue.param", type: "measure", title: "Revenue with param" },
            ],
            edges: [],
        });

        expect(await listParameterReferences(backend, "ws-1", parameterItem)).toEqual([
            "Rep performance",
            "Revenue with param",
        ]);
        expect(getReferences).toHaveBeenCalledWith(
            { identifier: "param.id", type: "parameter" },
            { direction: "up" },
        );
    });

    it("listParameterReferences reports nothing when only the root is present", async () => {
        const { backend, getReferences } = createFakeBackend();
        getReferences.mockResolvedValueOnce({
            nodes: [{ identifier: "param.id", type: "parameter", title: "My Param", isRoot: true }],
            edges: [],
        });

        expect(await listParameterReferences(backend, "ws-1", parameterItem)).toEqual([]);
    });
});
