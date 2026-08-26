// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import { workspaceNumberParameter } from "../../../tests/parameterFixtures.test.helpers.js";

import { useValidateExistingAutomationFilters } from "./useValidateExistingAutomationFilters.js";

interface IMockContextState {
    enableParameters: boolean;
    catalogParametersIsLoaded: boolean;
    catalog: IParameterMetadataObject[];
}

let mockState: IMockContextState;

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: () => ({
        lockedFilters: [],
        hiddenFilters: [],
        availableFilters: [],
        commonDateFilterId: undefined,
        automationFiltersByTab: [],
        attributeFilterSelectionTypeMap: undefined,
        attributeFilterSelectionTypeMapByTab: undefined,
        // The alert under test carries no export definitions, so filter validation short-circuits
        // and the per-tab export-parameter path is empty; only the alert-parameter inputs matter.
        parameters: {
            enabled: mockState.enableParameters,
            stringParametersEnabled: true,
            catalog: mockState.catalog,
            catalogIsLoaded: mockState.catalogParametersIsLoaded,
            dashboardParametersByTab: {},
        },
        tabIds: [],
        widgetLocalIdToTabIdMap: {},
    }),
}));

const alertWithParameters = (parameters: IInsightParameterValue[]): IAutomationMetadataObject => ({
    type: "automation",
    id: "alert-1",
    ref: idRef("alert-1"),
    uri: "/alert-1",
    title: "Alert",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    alert: {
        condition: { type: "comparison", operator: "GREATER_THAN", right: 1, left: { id: "m1" } },
        execution: { attributes: [], measures: [], filters: [], parameters },
        trigger: { state: "ACTIVE" },
    },
});

beforeEach(() => {
    mockState = {
        enableParameters: true,
        catalogParametersIsLoaded: true,
        catalog: [workspaceNumberParameter("topN", "Top N", 3)],
    };
});

describe("useValidateExistingAutomationFilters — alert parameter staleness", () => {
    it("is invalid when a stored alert parameter's ref left the workspace catalog", () => {
        const { result } = renderHook(() =>
            useValidateExistingAutomationFilters({
                automationToEdit: alertWithParameters([{ ref: idRef("removed", "parameter"), value: 1 }]),
            }),
        );

        expect(result.current.parametersAreStale).toBe(true);
        expect(result.current.isValid).toBe(false);
        // The repair must not clobber valid saved filters when only a parameter is stale.
        expect(result.current.filtersAreStale).toBe(false);
    });

    it("is valid when every stored alert parameter is still in the catalog", () => {
        const { result } = renderHook(() =>
            useValidateExistingAutomationFilters({
                automationToEdit: alertWithParameters([{ ref: idRef("topN", "parameter"), value: 8 }]),
            }),
        );

        expect(result.current.parametersAreStale).toBe(false);
        expect(result.current.isValid).toBe(true);
    });

    it("does not warn while the catalog is still loading", () => {
        mockState.catalogParametersIsLoaded = false;

        const { result } = renderHook(() =>
            useValidateExistingAutomationFilters({
                automationToEdit: alertWithParameters([{ ref: idRef("removed", "parameter"), value: 1 }]),
            }),
        );

        expect(result.current.parametersAreStale).toBe(false);
        expect(result.current.isValid).toBe(true);
    });
});
