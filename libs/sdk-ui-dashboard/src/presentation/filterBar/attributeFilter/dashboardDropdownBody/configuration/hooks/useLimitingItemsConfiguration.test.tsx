// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IDashboardAttributeFilter, type ObjRef, idRef } from "@gooddata/sdk-model";

import {
    newRestrictedLimitingItemsMap,
    selectRestrictedLimitingItemsMap,
} from "../../../../../../model/store/unavailableObjects/unavailableObjectsSelectors.js";

import { useLimitingItemsConfiguration } from "./useLimitingItemsConfiguration.js";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by an earlier test file in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

const { saveLimitingItems, unavailable } = vi.hoisted(() => ({
    saveLimitingItems: vi.fn(),
    unavailable: [] as IUnavailableDashboardReference[],
}));

vi.mock("../../../../../../model/react/useDashboardCommandProcessing.js", () => ({
    useDashboardCommandProcessing: () => ({ run: saveLimitingItems }),
}));

vi.mock("../../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) =>
        selector === selectRestrictedLimitingItemsMap ? newRestrictedLimitingItemsMap(unavailable) : [],
}));

const readableMetric = idRef("readable-metric", "measure");
const restrictedMetric = idRef("restricted-metric", "measure");
const restrictedFact = idRef("restricted-fact", "fact");

const currentFilter = (validateElementsBy: ObjRef[]) =>
    ({
        attributeFilter: {
            displayForm: idRef("current-label"),
            localIdentifier: "current-filter",
            validateElementsBy,
        },
    }) as IDashboardAttributeFilter;

beforeEach(() => {
    vi.clearAllMocks();
    unavailable.splice(
        0,
        unavailable.length,
        { ref: restrictedMetric, type: "measure", reason: "forbidden" },
        { ref: restrictedFact, type: "fact", reason: "forbidden" },
    );
});

describe("useLimitingItemsConfiguration", () => {
    it("lists only the items the user may read", () => {
        const { result } = renderHook(() =>
            useLimitingItemsConfiguration(currentFilter([restrictedMetric, readableMetric, restrictedFact])),
        );

        expect(result.current.limitingItems).toEqual([readableMetric]);
    });

    it("keeps the items the panel cannot show when another item is removed", () => {
        const { result } = renderHook(() =>
            useLimitingItemsConfiguration(currentFilter([restrictedMetric, readableMetric, restrictedFact])),
        );

        act(() => result.current.onLimitingItemsUpdate([]));
        act(() => result.current.onLimitingItemsChange());

        expect(saveLimitingItems).toHaveBeenCalledWith("current-filter", [restrictedMetric, restrictedFact]);
    });

    it("dispatches nothing when only items the panel cannot show are set", () => {
        const { result } = renderHook(() => useLimitingItemsConfiguration(currentFilter([restrictedMetric])));

        act(() => result.current.onLimitingItemsChange());

        expect(saveLimitingItems).not.toHaveBeenCalled();
    });
});
