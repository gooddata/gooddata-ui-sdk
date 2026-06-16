// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IDashboardExportParameter,
    type IDashboardParameter,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import { selectCatalogParameters } from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../../../../model/store/config/configSelectors.js";
import { selectWidgetLocalIdToTabIdMap } from "../../../../../model/store/tabs/layout/layoutSelectors.js";
import { selectTabs } from "../../../../../model/store/tabs/tabsSelectors.js";
import type { ExtendedDashboardWidget } from "../../../../../model/types/layoutTypes.js";
import {
    type IUseAutomationExportParametersProps,
    useAutomationExportParameters,
} from "../useAutomationExportParameters.js";

import { dashboardParameter, workspaceParameter } from "./parameterFixtures.js";

interface IMockStoreState {
    enableParameters: boolean;
    catalog: IParameterMetadataObject[];
    dashboardParametersByTab: Record<string, IDashboardParameter[]>;
    tabs: Array<{ localIdentifier: string }> | undefined;
    widgetTabMap: Record<string, string>;
    effectiveParametersByTab: Record<string, IDashboardExportParameter[]>;
}

let mockState: IMockStoreState;

// Sentinel selectors for the mocked parametersSelectors module; hoisted function declarations so the
// vi.mock factories (which vitest hoists above imports) can reference them.
function exportEffectiveParametersSelector(): never {
    throw new Error("Sentinel selector must be resolved by the useDashboardSelector mock.");
}
function smartPersistedTabsParametersSelector(): never {
    throw new Error("Sentinel selector must be resolved by the useDashboardSelector mock.");
}

function resolveSelectorValue(selector: unknown): unknown {
    switch (selector) {
        case selectEnableParameters:
            return mockState.enableParameters;
        case selectCatalogParameters:
            return mockState.catalog;
        case smartPersistedTabsParametersSelector:
            return mockState.dashboardParametersByTab;
        case selectTabs:
            return mockState.tabs;
        case selectWidgetLocalIdToTabIdMap:
            return mockState.widgetTabMap;
        case exportEffectiveParametersSelector:
            return mockState.effectiveParametersByTab;
        default:
            throw new Error("Unexpected selector in useAutomationExportParameters test.");
    }
}

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => resolveSelectorValue(selector),
}));

vi.mock("../../../../../model/store/tabs/parameters/parametersSelectors.js", () => ({
    selectSmartPersistedTabsParameters: smartPersistedTabsParametersSelector,
    selectExportEffectiveParameters: () => exportEffectiveParametersSelector,
}));

const existingAutomation = (
    parametersByTab: Record<string, IDashboardExportParameter[]> | undefined,
): IAutomationMetadataObject => ({
    type: "automation",
    id: "automation-1",
    ref: idRef("automation-1"),
    uri: "/automation-1",
    title: "Schedule",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    exportDefinitions: [
        {
            type: "exportDefinition",
            id: "export-1",
            ref: idRef("export-1"),
            uri: "/export-1",
            title: "Dashboard",
            description: "",
            tags: [],
            production: true,
            deprecated: false,
            unlisted: false,
            requestPayload: {
                type: "dashboard",
                fileName: "Dashboard",
                format: "PDF",
                content: { dashboard: "dash", parametersByTab },
            },
        },
    ],
});

const insightWidget: ExtendedDashboardWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ignoreDashboardFilters: [],
    drills: [],
    title: "Widget",
    description: "",
    ref: idRef("w1"),
    uri: "/w1",
    identifier: "w1",
    localIdentifier: "w1",
};

const topNRef = idRef("topN", "parameter");

beforeEach(() => {
    mockState = {
        enableParameters: true,
        catalog: [workspaceParameter("topN", "Top N", 3), workspaceParameter("limit", "Limit", 50)],
        dashboardParametersByTab: { tab1: [dashboardParameter("topN", { value: 5 })] },
        tabs: [{ localIdentifier: "tab1" }],
        widgetTabMap: { w1: "tab1" },
        effectiveParametersByTab: { tab1: [{ id: "topN", value: "5", title: "Top N" }] },
    };
});

function renderParametersHook(props: Omit<IUseAutomationExportParametersProps, "setParametersWire"> = {}) {
    const setParametersWire = vi.fn();
    const hook = renderHook(() =>
        useAutomationExportParameters({ storeParameters: true, ...props, setParametersWire }),
    );
    return { ...hook, setParametersWire };
}

describe("useAutomationExportParameters — mount", () => {
    it("never writes the automation on mount — new automations are seeded at document creation", () => {
        const { result, setParametersWire } = renderParametersHook();

        expect(setParametersWire).not.toHaveBeenCalled();
        // ...but the working set still reflects the dashboard's effective values for editing
        expect(result.current.visibleParametersByTab["tab1"]?.map((parameter) => parameter.value)).toEqual([
            5,
        ]);
    });

    it("never writes the automation on mount when editing — the stored wire must survive untouched", () => {
        // "1.50" would re-encode to "1.5"; a mount write would make an untouched dialog dirty.
        const { result, setParametersWire } = renderParametersHook({
            automationToEdit: existingAutomation({ tab1: [{ id: "topN", value: "1.50", title: "Top N" }] }),
        });

        expect(setParametersWire).not.toHaveBeenCalled();
        expect(result.current.visibleParametersByTab["tab1"]?.map((parameter) => parameter.value)).toEqual([
            1.5,
        ]);
    });

    it("exposes nothing and stays silent when the feature flag is off", () => {
        mockState.enableParameters = false;

        const { result, setParametersWire } = renderParametersHook();

        expect(setParametersWire).not.toHaveBeenCalled();
        expect(result.current.parametersEnabled).toBe(false);
        expect(result.current.visibleParametersByTab).toEqual({});
        expect(result.current.availableParametersByTab).toEqual({});
    });
});

describe("useAutomationExportParameters — chip edits", () => {
    it("adds a chip seeded from the addable set and writes the wire", () => {
        mockState.effectiveParametersByTab = {};
        const { result, setParametersWire } = renderParametersHook();

        act(() => {
            result.current.onParameterAddByTab("tab1", topNRef);
        });

        // Seeded from the dashboard-configured value (5), not the workspace default (3)
        expect(setParametersWire).toHaveBeenLastCalledWith({
            tab1: [{ id: "topN", value: "5", title: "Top N" }],
        });
        expect(result.current.visibleParametersByTab["tab1"]?.map((parameter) => parameter.value)).toEqual([
            5,
        ]);
    });

    it("changes a chip value and re-encodes the wire", () => {
        const { result, setParametersWire } = renderParametersHook();

        act(() => {
            result.current.onParameterChangeByTab("tab1", topNRef, 7);
        });

        expect(setParametersWire).toHaveBeenLastCalledWith({
            tab1: [{ id: "topN", value: "7", title: "Top N" }],
        });
    });

    it("deletes a chip but keeps the tab's (now empty) execution set on the wire", () => {
        const { result, setParametersWire } = renderParametersHook();

        act(() => {
            result.current.onParameterDeleteByTab("tab1", topNRef);
        });

        // An empty array must stay — omitting the tab would make the server fall back to defaults.
        expect(setParametersWire).toHaveBeenLastCalledWith({ tab1: [] });
        expect(result.current.visibleParametersByTab["tab1"]).toEqual([]);
    });

    it("delegates flat handlers to the single dashboard tab", () => {
        const { result, setParametersWire } = renderParametersHook();

        expect(result.current.flatTabId).toBe("tab1");
        act(() => {
            result.current.onParameterChange(topNRef, 9);
        });

        expect(setParametersWire).toHaveBeenLastCalledWith({
            tab1: [{ id: "topN", value: "9", title: "Top N" }],
        });
    });

    it("delegates flat handlers to the widget's owning tab", () => {
        const { result, setParametersWire } = renderParametersHook({ widget: insightWidget });

        expect(result.current.flatTabId).toBe("tab1");
        act(() => {
            result.current.onParameterChange(topNRef, 9);
        });

        expect(setParametersWire).toHaveBeenLastCalledWith({
            tab1: [{ id: "topN", value: "9", title: "Top N" }],
        });
    });

    it("re-seeds a re-added widget parameter from the widget-effective value, not the default", () => {
        // Widget renders "limit" as 99 (insight-authored), and the dashboard has no override for it,
        // so the workspace default (50) would be wrong. Re-adding after a delete must restore 99.
        const limitRef = idRef("limit", "parameter");
        mockState.effectiveParametersByTab = { tab1: [{ id: "limit", value: "99", title: "Limit" }] };
        const { result, setParametersWire } = renderParametersHook({ widget: insightWidget });

        act(() => {
            result.current.onParameterDeleteByTab("tab1", limitRef);
        });
        act(() => {
            result.current.onParameterAddByTab("tab1", limitRef);
        });

        expect(setParametersWire).toHaveBeenLastCalledWith({
            tab1: [{ id: "limit", value: "99", title: "Limit" }],
        });
    });
});

describe("useAutomationExportParameters — applyLatest", () => {
    it("resets the working set to the dashboard's effective values and writes the wire", () => {
        const { result, setParametersWire } = renderParametersHook({
            automationToEdit: existingAutomation({ tab1: [{ id: "topN", value: "8", title: "Top N" }] }),
        });
        expect(result.current.visibleParametersByTab["tab1"]?.map((parameter) => parameter.value)).toEqual([
            8,
        ]);

        act(() => {
            result.current.applyLatest();
        });

        expect(setParametersWire).toHaveBeenCalledWith({
            tab1: [{ id: "topN", value: "5", title: "Top N" }],
        });
        expect(result.current.visibleParametersByTab["tab1"]?.map((parameter) => parameter.value)).toEqual([
            5,
        ]);
    });
});

describe("useAutomationExportParameters — onStoreParametersChange", () => {
    it("drops persistence when store-parameters is turned off while keeping the chips", () => {
        const { result, setParametersWire } = renderParametersHook({
            automationToEdit: existingAutomation({ tab1: [{ id: "topN", value: "8", title: "Top N" }] }),
        });

        act(() => {
            result.current.onStoreParametersChange(false);
        });

        expect(setParametersWire).toHaveBeenLastCalledWith(undefined);
        expect(result.current.visibleParametersByTab["tab1"]?.map((parameter) => parameter.value)).toEqual([
            8,
        ]);

        act(() => {
            result.current.onStoreParametersChange(true);
        });

        expect(setParametersWire).toHaveBeenLastCalledWith({
            tab1: [{ id: "topN", value: "8", title: "Top N" }],
        });
    });
});
