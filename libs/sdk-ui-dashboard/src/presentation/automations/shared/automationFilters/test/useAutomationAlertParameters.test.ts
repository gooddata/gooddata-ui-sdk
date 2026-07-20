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
import {
    selectEnableParameters,
    selectEnableStringParameters,
} from "../../../../../model/store/config/configSelectors.js";
import { useAutomationAlertParameters } from "../useAutomationAlertParameters.js";

import { workspaceNumberParameter, workspaceStringParameter } from "./parameterFixtures.js";

interface IMockStoreState {
    enableParameters: boolean;
    enableStringParameters: boolean;
    catalogParametersIsLoaded: boolean;
    catalog: IParameterMetadataObject[];
}

let mockState: IMockStoreState;

function resolveSelectorValue(selector: unknown): unknown {
    switch (selector) {
        case selectEnableParameters:
            return mockState.enableParameters;
        case selectEnableStringParameters:
            return mockState.enableStringParameters;
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
        enableStringParameters: true,
        catalogParametersIsLoaded: true,
        catalog: [workspaceNumberParameter("topN", "Top N", 3)],
    };
});

describe("useAutomationAlertParameters — string parameter chips", () => {
    const storedParameters = [
        { ref: idRef("topN", "parameter"), value: 8 },
        { ref: idRef("scenario", "parameter"), value: "Budget" },
    ];

    it("renders a stored STRING value as an editable chip when string parameters are enabled", () => {
        mockState.catalog = [
            workspaceNumberParameter("topN", "Top N", 3),
            workspaceStringParameter("scenario", "Scenario", "Actual"),
        ];
        const { result } = renderAlertParametersHook(alertAutomation(storedParameters));

        expect(
            result.current.automationParameters.map((parameter) => [
                parameter.ref.identifier,
                parameter.value,
            ]),
        ).toEqual([
            ["topN", 8],
            ["scenario", "Budget"],
        ]);
    });

    it("hides a stored STRING value when string parameters are gated off, without deleting it on edit", () => {
        // Flag off: the catalog-branch gate drops the STRING definition even though it's still in the catalog.
        mockState.catalog = [
            workspaceNumberParameter("topN", "Top N", 3),
            workspaceStringParameter("scenario", "Scenario", "Actual"),
        ];
        mockState.enableStringParameters = false;
        const { result } = renderAlertParametersHook(alertAutomation(storedParameters));

        expect(result.current.automationParameters.map((parameter) => parameter.ref.identifier)).toEqual([
            "topN",
        ]);

        act(() => {
            result.current.onParameterChange(idRef("topN", "parameter"), 5);
        });

        expect(result.current.editedAutomation?.alert?.execution.parameters).toEqual([
            { ref: idRef("topN", "parameter"), value: 5 },
            { ref: idRef("scenario", "parameter"), value: "Budget" },
        ]);
    });

    it("writes an edited STRING chip value back to the stored parameters", () => {
        mockState.catalog = [
            workspaceNumberParameter("topN", "Top N", 3),
            workspaceStringParameter("scenario", "Scenario", "Actual"),
        ];
        const { result } = renderAlertParametersHook(alertAutomation(storedParameters));

        act(() => {
            result.current.onParameterChange(idRef("scenario", "parameter"), "Forecast");
        });

        expect(result.current.editedAutomation?.alert?.execution.parameters).toEqual([
            { ref: idRef("topN", "parameter"), value: 8 },
            { ref: idRef("scenario", "parameter"), value: "Forecast" },
        ]);
    });
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
