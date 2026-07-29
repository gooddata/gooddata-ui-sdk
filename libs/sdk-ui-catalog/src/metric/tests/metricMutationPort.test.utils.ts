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

/** @internal */
export function createTestMetricMutationPort(
    overrides: Partial<IMetricMutationPort> = {},
): IMetricMutationPort {
    return {
        create: vi.fn().mockResolvedValue(defaultSavedItem),
        update: vi.fn().mockResolvedValue(defaultSavedItem),
        delete: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}
