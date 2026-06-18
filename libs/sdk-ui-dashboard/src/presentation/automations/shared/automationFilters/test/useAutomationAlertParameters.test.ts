// (C) 2026 GoodData Corporation

import { useState } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObjectDefinition,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import {
    selectCatalogParameters,
    selectCatalogParametersIsLoaded,
} from "../../../../../model/store/catalog/catalogSelectors.js";
import { selectEnableParameters } from "../../../../../model/store/config/configSelectors.js";
import { useAutomationAlertParameters } from "../useAutomationAlertParameters.js";

import { workspaceParameter } from "./parameterFixtures.js";

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
            // The remaining selectors (effective dashboard/widget parameter values) only feed the
            // chip-display derivation, which dropStaleParameters does not touch — an empty list
            // renders the hook without needing to mock parametersSelectors' factory selectors.
            return [];
    }
}

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => resolveSelectorValue(selector),
}));

const alertAutomation = (
    parameters: IInsightParameterValue[] | undefined,
): IAutomationMetadataObjectDefinition => ({
    type: "automation",
    title: "Alert",
    alert: {
        condition: { type: "comparison", operator: "GREATER_THAN", right: 1, left: { id: "m1" } },
        execution: { attributes: [], measures: [], filters: [], parameters },
        trigger: { state: "ACTIVE" },
    },
});

function renderAlertParametersHook(initial: IAutomationMetadataObjectDefinition) {
    return renderHook(() => {
        const [editedAutomation, setEditedAutomation] = useState<
            IAutomationMetadataObjectDefinition | undefined
        >(initial);
        const api = useAutomationAlertParameters({ editedAutomation, setEditedAutomation });
        return { editedAutomation, ...api };
    });
}

beforeEach(() => {
    mockState = {
        enableParameters: true,
        catalogParametersIsLoaded: true,
        catalog: [workspaceParameter("topN", "Top N", 3)],
    };
});

describe("useAutomationAlertParameters — dropStaleParameters", () => {
    it("drops stored parameters whose ref left the catalog, keeping the present ones", () => {
        const { result } = renderAlertParametersHook(
            alertAutomation([
                { ref: idRef("topN", "parameter"), value: 8 },
                { ref: idRef("removed", "parameter"), value: 1 },
            ]),
        );

        act(() => {
            result.current.dropStaleParameters();
        });

        expect(result.current.editedAutomation?.alert?.execution.parameters).toEqual([
            { ref: idRef("topN", "parameter"), value: 8 },
        ]);
    });

    it("leaves a param-less alert's parameters absent (no undefined → [] flip)", () => {
        const { result } = renderAlertParametersHook(alertAutomation(undefined));

        act(() => {
            result.current.dropStaleParameters();
        });

        expect(result.current.editedAutomation?.alert?.execution.parameters).toBeUndefined();
    });

    it("keeps the parameters untouched when none are stale", () => {
        const parameters = [{ ref: idRef("topN", "parameter"), value: 8 }];
        const { result } = renderAlertParametersHook(alertAutomation(parameters));

        act(() => {
            result.current.dropStaleParameters();
        });

        expect(result.current.editedAutomation?.alert?.execution.parameters).toEqual(parameters);
    });

    it("no-ops while the catalog is still loading, so valid overrides are not wiped", () => {
        // Repairing a filter-only-invalid alert before the catalog loads: an empty catalog must
        // not be treated as authoritative, or every stored override would be dropped.
        mockState.catalogParametersIsLoaded = false;
        mockState.catalog = [];
        const parameters = [{ ref: idRef("topN", "parameter"), value: 8 }];
        const { result } = renderAlertParametersHook(alertAutomation(parameters));

        act(() => {
            result.current.dropStaleParameters();
        });

        expect(result.current.editedAutomation?.alert?.execution.parameters).toEqual(parameters);
    });

    it("no-ops when the parameters feature is disabled", () => {
        mockState.enableParameters = false;
        mockState.catalog = [];
        const parameters = [{ ref: idRef("topN", "parameter"), value: 8 }];
        const { result } = renderAlertParametersHook(alertAutomation(parameters));

        act(() => {
            result.current.dropStaleParameters();
        });

        expect(result.current.editedAutomation?.alert?.execution.parameters).toEqual(parameters);
    });
});
