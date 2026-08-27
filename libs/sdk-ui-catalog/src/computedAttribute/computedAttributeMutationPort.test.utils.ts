// (C) 2026 GoodData Corporation

import { vi } from "vitest";

import type { ICatalogItemComputedAttribute } from "../catalogItem/types.js";

import type { IComputedAttributeMutationPort } from "./computedAttributeMutationPort.js";

const defaultSavedItem: ICatalogItemComputedAttribute = {
    identifier: "test-computed-attribute",
    type: "computedAttribute",
    title: "Test Computed Attribute",
    description: "",
    tags: [],
    createdBy: "test",
    updatedBy: "test",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

/** @internal */
export function createTestComputedAttributeMutationPort(
    overrides: Partial<IComputedAttributeMutationPort> = {},
): IComputedAttributeMutationPort {
    return {
        create: vi.fn().mockResolvedValue(defaultSavedItem),
        update: vi.fn().mockResolvedValue(defaultSavedItem),
        delete: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}
