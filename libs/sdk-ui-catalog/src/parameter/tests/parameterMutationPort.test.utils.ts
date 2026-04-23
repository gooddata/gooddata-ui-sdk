// (C) 2026 GoodData Corporation

import { vi } from "vitest";

import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import type { IParameterMutationPort } from "../parameterMutationPort.js";

const defaultSavedItem: ICatalogItemParameter = {
    identifier: "test-parameter",
    type: "parameter",
    title: "Test Parameter",
    description: "",
    tags: [],
    createdBy: "test",
    updatedBy: "test",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 0 },
};

/**
 * Test utility. Returns a parameter mutation port with vi.fn() stubs.
 * @internal
 */
export function createTestParameterMutationPort(
    overrides: Partial<IParameterMutationPort> = {},
): IParameterMutationPort {
    return {
        create: vi.fn().mockResolvedValue(defaultSavedItem),
        update: vi.fn().mockResolvedValue(defaultSavedItem),
        delete: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}
