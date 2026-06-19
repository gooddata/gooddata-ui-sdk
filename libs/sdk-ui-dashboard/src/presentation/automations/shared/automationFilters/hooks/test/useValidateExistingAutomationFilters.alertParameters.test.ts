// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import {
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
} from "../../../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../../../../../model/store/config/configSelectors.js";
import { workspaceParameter } from "../../test/parameterFixtures.js";
import { useValidateExistingAutomationFilters } from "../useValidateExistingAutomationFilters.js";

interface IMockStoreState {
    enableParameters: boolean;
    catalogParametersIsLoaded: boolean;
    catalog: IParameterMetadataObject[];
}

let mockState: IMockStoreState;

function resolveSelectorValue(selector: unknown): unknown {
    switch (selector) {
        case selectEnableParameters:
            return mockState.enableParameters;
        case selectCatalogParameters:
            return mockState.catalog;
        case selectCatalogParametersIsLoaded:
            return mockState.catalogParametersIsLoaded;
        default:
            // The alert under test carries no export definitions, so filter validation short-circuits
            // (no saved dashboard filters) and the per-tab export-parameter path is empty. Every other
            // selector the hook reads is therefore irrelevant to alert-parameter staleness.
            return undefined;
    }
}

vi.mock("../../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => resolveSelectorValue(selector),
}));

vi.mock("../../../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: () => ({
        lockedFilters: [],
        hiddenFilters: [],
        availableFilters: [],
        commonDateFilterId: undefined,
        automationFiltersByTab: [],
        attributeFilterSelectionTypeMap: undefined,
        attributeFilterSelectionTypeMapByTab: undefined,
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
        catalog: [workspaceParameter("topN", "Top N", 3)],
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
