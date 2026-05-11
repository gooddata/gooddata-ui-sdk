// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObject } from "@gooddata/sdk-model";

import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { createParameterMutationAdapter } from "../parameterMutationPort.js";

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
    } = {},
) {
    const createParameter = overrides.createParameter ?? vi.fn().mockResolvedValue(savedParameter);
    const updateParameter = overrides.updateParameter ?? vi.fn().mockResolvedValue(savedParameter);
    const deleteParameter = overrides.deleteParameter ?? vi.fn().mockResolvedValue(undefined);
    const backend = {
        workspace: () => ({
            parameters: () => ({
                createParameter,
                updateParameter,
                deleteParameter,
            }),
        }),
    } as unknown as IAnalyticalBackend;
    return { backend, createParameter, updateParameter, deleteParameter };
}

describe("parameterMutationPort adapter", () => {
    const existingItem: ICatalogItemParameter = {
        identifier: "param.id",
        type: "parameter",
        title: "My Param",
        description: "Description",
        tags: [],
        createdBy: "user",
        updatedBy: "user",
        createdAt: null,
        updatedAt: null,
        isLocked: false,
        isEditable: true,
        definition: { type: "NUMBER", defaultValue: 10 },
    };

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
        it("calls backend updateParameter with the item's fields and returns the converted item", async () => {
            const { backend, updateParameter } = createFakeBackend();

            const adapter = createParameterMutationAdapter(backend, "ws-1");
            const result = await adapter.update(existingItem);

            expect(updateParameter).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: "My Param",
                    description: "Description",
                    tags: [],
                    definition: { type: "NUMBER", defaultValue: 10 },
                }),
            );
            expect(result).toMatchObject({
                type: "parameter",
                identifier: "param.id",
            });
        });
    });
});
