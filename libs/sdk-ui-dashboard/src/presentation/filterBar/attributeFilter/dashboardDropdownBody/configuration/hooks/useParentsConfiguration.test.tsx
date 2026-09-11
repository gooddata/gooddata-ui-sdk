// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type DashboardAttributeFilterItem,
    type IDashboardAttributeFilter,
    type IDashboardAttributeFilterParent,
    idRef,
} from "@gooddata/sdk-model";

import { useParentsConfiguration } from "./useParentsConfiguration.js";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by an earlier test file in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

const { saveParentFilters } = vi.hoisted(() => ({ saveParentFilters: vi.fn() }));

vi.mock("../../../../../../model/react/useDispatchDashboardCommand.js", () => ({
    useDispatchDashboardCommand: () => saveParentFilters,
}));

vi.mock("@gooddata/sdk-ui", async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useBackend: () => ({ capabilities: { supportsSettingConnectingAttributes: false } }),
}));

const parent = (localIdentifier: string): IDashboardAttributeFilterParent => ({
    filterLocalIdentifier: localIdentifier,
    over: { attributes: [idRef(`${localIdentifier}-connecting-attribute`)] },
});
const visibleParent = parent("visible-parent");
const restrictedParent = parent("restricted-parent");

// The panel only ever receives neighbors the user may see, so a restricted parent has no item here.
const neighborFilters = [
    { attributeFilter: { displayForm: idRef("visible-label"), localIdentifier: "visible-parent" } },
] as unknown as DashboardAttributeFilterItem[];

const currentFilter = (parents: IDashboardAttributeFilterParent[]) =>
    ({
        attributeFilter: {
            displayForm: idRef("current-label"),
            localIdentifier: "current-filter",
            filterElementsBy: parents,
        },
    }) as IDashboardAttributeFilter;

beforeEach(() => {
    vi.clearAllMocks();
});

describe("useParentsConfiguration", () => {
    it("keeps a parent the panel cannot show when another parent is deselected", () => {
        const { result } = renderHook(() =>
            useParentsConfiguration(neighborFilters, currentFilter([visibleParent, restrictedParent])),
        );

        act(() => result.current.onParentSelect("visible-parent", false, undefined));
        act(() => result.current.onParentFiltersChange());

        expect(saveParentFilters).toHaveBeenCalledWith("current-filter", [restrictedParent]);
    });

    it("keeps that parent alongside a newly selected one", () => {
        const { result } = renderHook(() =>
            useParentsConfiguration(neighborFilters, currentFilter([restrictedParent])),
        );

        act(() => result.current.onParentSelect("visible-parent", true, [idRef("over")]));
        act(() => result.current.onParentFiltersChange());

        expect(saveParentFilters).toHaveBeenCalledWith("current-filter", [
            restrictedParent,
            { filterLocalIdentifier: "visible-parent", over: { attributes: [] } },
        ]);
    });

    it("dispatches nothing when the configuration did not change", () => {
        const { result } = renderHook(() =>
            useParentsConfiguration(neighborFilters, currentFilter([restrictedParent])),
        );

        act(() => result.current.onParentFiltersChange());

        expect(saveParentFilters).not.toHaveBeenCalled();
    });
});
