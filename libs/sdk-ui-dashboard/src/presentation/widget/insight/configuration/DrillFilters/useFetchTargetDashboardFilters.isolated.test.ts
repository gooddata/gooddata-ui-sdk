// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import {
    DRILL_TARGET_TYPE,
    type IDrillConfigItem,
    type IDrillToDashboardConfigTarget,
} from "../../../../drill/types.js";

const mockUseDashboardSelector = vi.fn();
const mockFetchTargetDashboardFilters = vi.fn();
let mockCache: Record<string, { status: string; targetDashboardParameters: IDashboardParameter[] }> = {};

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
}));

vi.mock("./TargetDashboardFiltersContext.js", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useTargetDashboardFiltersContext: () => ({
        cache: mockCache,
        fetchTargetDashboardFilters: mockFetchTargetDashboardFilters,
    }),
}));

const { selectDashboardRef } = await import("../../../../../model/store/meta/metaSelectors.js");
const { selectDashboardParametersByTab } =
    await import("../../../../../model/store/tabs/parameters/parametersSelectors.js");
const { selectActiveOrDefaultTabLocalIdentifier } =
    await import("../../../../../model/store/tabs/tabsSelectors.js");
const { getTargetDashboardFiltersCacheKey } = await import("./TargetDashboardFiltersContext.js");
const { useFetchTargetDashboardFilters } = await import("./useFetchTargetDashboardFilters.js");

const sourceDashboardRef = idRef("source", "analyticalDashboard");
const otherDashboardRef = idRef("other", "analyticalDashboard");
const topN: IDashboardParameter = {
    ref: idRef("topN", "parameter"),
    parameterType: "NUMBER",
    mode: "active",
};
const region: IDashboardParameter = {
    ref: idRef("region", "parameter"),
    parameterType: "NUMBER",
    mode: "active",
};

beforeEach(() => {
    mockCache = {};
    mockUseDashboardSelector.mockImplementation((selector: unknown) => {
        if (selector === selectDashboardRef) {
            return sourceDashboardRef;
        }
        if (selector === selectDashboardParametersByTab) {
            return { first: [topN], second: [region] };
        }
        if (selector === selectActiveOrDefaultTabLocalIdentifier) {
            return "first";
        }
        return [];
    });
});

function drillItem(
    drillTargetType: DRILL_TARGET_TYPE,
    target: IDrillToDashboardConfigTarget = {},
): IDrillConfigItem {
    return {
        type: "attribute",
        title: "Product",
        originLocalIdentifier: "product",
        localIdentifier: "drill-1",
        drillTargetType,
        complete: true,
        attributes: [],
        widgetRef: idRef("widget", "insight"),
        ...target,
    };
}

function renderTargetParameters(item: IDrillConfigItem) {
    return renderHook(() => useFetchTargetDashboardFilters(item)).result.current.targetDashboardParameters;
}

describe("useFetchTargetDashboardFilters target parameters", () => {
    it("returns no parameters for a drill to a visualization", () => {
        expect(renderTargetParameters(drillItem(DRILL_TARGET_TYPE.DRILL_TO_INSIGHT))).toEqual([]);
    });

    it("returns the parameters of the active tab for a drill to the same dashboard without a target tab", () => {
        expect(
            renderTargetParameters(
                drillItem(DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD, {
                    dashboard: sourceDashboardRef,
                }),
            ),
        ).toEqual([topN]);
    });

    it("returns the parameters of the target tab of the same dashboard", () => {
        expect(
            renderTargetParameters(
                drillItem(DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD, {
                    dashboard: sourceDashboardRef,
                    dashboardTab: "second",
                }),
            ),
        ).toEqual([region]);
    });

    it("returns the parameters of another dashboard", () => {
        mockCache = {
            [getTargetDashboardFiltersCacheKey(otherDashboardRef)]: {
                status: "success",
                targetDashboardParameters: [topN],
            },
        };

        expect(
            renderTargetParameters(
                drillItem(DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD, {
                    dashboard: otherDashboardRef,
                }),
            ),
        ).toEqual([topN]);
    });

    it("returns no parameters while another dashboard loads", () => {
        expect(
            renderTargetParameters(
                drillItem(DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD, {
                    dashboard: otherDashboardRef,
                }),
            ),
        ).toEqual([]);
    });
});
