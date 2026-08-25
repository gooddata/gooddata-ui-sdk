// (C) 2026 GoodData Corporation

import { useState } from "react";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObjectDefinition,
    type IDashboardParameter,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import {
    dashboardParameter,
    workspaceNumberParameter,
    workspaceStringParameter,
} from "./parameterFixtures.js";
import { useAutomationAlertParameters } from "./useAutomationAlertParameters.js";

interface IMockContextState {
    enableParameters: boolean;
    enableStringParameters: boolean;
    catalogParametersIsLoaded: boolean;
    catalog: IParameterMetadataObject[];
}

let mockState: IMockContextState;

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns the `vi.mock()` below into a no-op. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes the static
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

// `vi.mock` resolves relative to THIS test file, which sits next to the hook, so the path here is
// the hook's own import path.
vi.mock("../../contexts/AutomationsContext.js", () => ({
    useAutomationsContext: () => ({
        parameters: {
            enabled: mockState.enableParameters,
            stringParametersEnabled: mockState.enableStringParameters,
            catalog: mockState.catalog,
            catalogIsLoaded: mockState.catalogParametersIsLoaded,
            dashboardParametersByTab: {},
        },
    }),
}));

const EMPTY_DASHBOARD_PARAMETERS: IDashboardParameter[] = [];
const EMPTY_WIDGET_PARAMETER_VALUES: IInsightParameterValue[] = [];

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

function renderAlertParametersHook(
    initial: IAutomationMetadataObjectDefinition,
    overrides: {
        dashboardParameters?: IDashboardParameter[];
        widgetParameterValues?: IInsightParameterValue[];
    } = {},
) {
    return renderHook(() => {
        const [editedAutomation, setEditedAutomation] = useState<
            IAutomationMetadataObjectDefinition | undefined
        >(initial);
        const api = useAutomationAlertParameters({
            editedAutomation,
            setEditedAutomation,
            dashboardParameters: overrides.dashboardParameters ?? EMPTY_DASHBOARD_PARAMETERS,
            widgetParameterValues: overrides.widgetParameterValues ?? EMPTY_WIDGET_PARAMETER_VALUES,
        });
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

describe("useAutomationAlertParameters — widget-scoped inputs come from props", () => {
    it("offers a workspace parameter whose widget-effective value was passed in", () => {
        mockState.catalog = [workspaceNumberParameter("topN", "Top N", 3)];

        const { result } = renderAlertParametersHook(alertAutomation([]), {
            widgetParameterValues: [{ ref: idRef("topN", "parameter"), value: 42 }],
        });

        expect(
            result.current.availableParameters.map((parameter) => [
                parameter.ref.identifier,
                parameter.value,
            ]),
        ).toEqual([["topN", 42]]);
    });

    it("renders a stored chip with the dashboard parameter's label and mode", () => {
        // Twin of the widgetParameterValues sentinel above, for the other widget-scoped prop.
        // dashboardParameters is what reconstructAutomationParametersFromValues resolves title and
        // mode from, so a non-empty one must beat the workspace catalog's title.
        const { result } = renderAlertParametersHook(
            alertAutomation([{ ref: idRef("topN", "parameter"), value: 8 }]),
            {
                dashboardParameters: [
                    dashboardParameter("topN", { label: "Renamed on the dashboard", mode: "readonly" }),
                ],
            },
        );

        expect(
            result.current.automationParameters.map((parameter) => [
                parameter.ref.identifier,
                parameter.title,
                parameter.mode,
            ]),
        ).toEqual([["topN", "Renamed on the dashboard", "readonly"]]);
    });
});
