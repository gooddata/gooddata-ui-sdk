// (C) 2026 GoodData Corporation

import { vi } from "vitest";

import type { ICatalogItemMeasure } from "../../catalogItem/types.js";
import type { IMetricMutationPort } from "../metricMutationPort.js";

const defaultSavedItem: ICatalogItemMeasure = {
    identifier: "test-metric",
    type: "measure",
    title: "Test Metric",
    description: "",
    tags: [],
    createdBy: "test",
    updatedBy: "test",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    format: "#,##0.00",
};

/**
 * Test utility. Returns a metric mutation port with vi.fn() stubs.
 * @internal
 */
export function createTestMetricMutationPort(
    overrides: Partial<IMetricMutationPort> = {},
): IMetricMutationPort {
    return {
        create: vi.fn().mockResolvedValue(defaultSavedItem),
        update: vi.fn().mockResolvedValue(defaultSavedItem),
        delete: vi.fn().mockResolvedValue(undefined),
        load: vi.fn().mockResolvedValue({
            id: "test-metric",
            uri: "test-metric",
            ref: { identifier: "test-metric", type: "measure" },
            type: "measure",
            title: "Test Metric",
            description: "",
            tags: [],
            production: true,
            deprecated: false,
            unlisted: false,
            expression: "SELECT 1",
            format: "#,##0.00",
        }),
        getReferencingObjects: vi.fn().mockResolvedValue({ insights: [], measures: [] }),
        ...overrides,
    };
}
