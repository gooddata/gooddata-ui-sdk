// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    DashboardParameterModeValues,
    type IDashboardParameter,
    type IParameterMetadataObject,
    type ParameterValue,
    idRef,
} from "@gooddata/sdk-model";

import { selectCatalogParameterByRef } from "../../../model/store/catalog/catalogSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { tabsActions } from "../../../model/store/tabs/index.js";
import { type ParameterReconciliation } from "../../../model/store/tabs/parameters/parametersHelpers.js";
import {
    selectParameterReconciliationByRef,
    selectParameterRuntimeOverrideByRef,
} from "../../../model/store/tabs/parameters/parametersSelectors.js";
import { createInternalIntl } from "../../localization/createInternalIntl.js";

import { DashboardParameterFilter } from "./DashboardParameterFilter.js";

const paramRef = idRef("topN", "parameter");
const scenarioRef = idRef("scenario", "parameter");
const enumRef = idRef("scenarioEnum", "parameter");

const workspaceParameter: IParameterMetadataObject = {
    type: "parameter",
    id: "topN",
    uri: "/topN",
    ref: paramRef,
    title: "Top N",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
};

const stringWorkspaceParameter: IParameterMetadataObject = {
    ...workspaceParameter,
    id: "scenario",
    uri: "/scenario",
    ref: scenarioRef,
    title: "Scenario",
    definition: { type: "STRING", defaultValue: "Actual" },
};

const enumWorkspaceParameter: IParameterMetadataObject = {
    ...workspaceParameter,
    id: "scenarioEnum",
    uri: "/scenarioEnum",
    ref: enumRef,
    title: "Scenario",
    definition: {
        type: "STRING",
        defaultValue: "actual",
        constraints: {
            allowedValues: [
                { value: "actual", title: "Actual" },
                { value: "budget", title: "Budget Plan" },
                { value: "forecast", title: "Forecast" },
            ],
        },
    },
};

const parameter: IDashboardParameter = {
    ref: paramRef,
    mode: DashboardParameterModeValues.READONLY,
    parameterType: "NUMBER",
    value: 250,
};

const activeNumberParameter: IDashboardParameter = {
    ref: paramRef,
    mode: DashboardParameterModeValues.ACTIVE,
    parameterType: "NUMBER",
};

const activeStringParameter: IDashboardParameter = {
    ref: scenarioRef,
    mode: DashboardParameterModeValues.ACTIVE,
    parameterType: "STRING",
};

const activeEnumParameter: IDashboardParameter = {
    ref: enumRef,
    mode: DashboardParameterModeValues.ACTIVE,
    parameterType: "STRING",
};

const RESET_TOOLTIP =
    "The original value is out of range, so the default is applied until you set a valid value.";

let mockReconciliation: ParameterReconciliation | undefined;
const mockCaptured: { warningTooltip?: string; value?: ParameterValue } = {};
const mockUseDashboardSelector = vi.fn();
const mockDispatch = vi.fn();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => mockDispatch,
}));

vi.mock("../../dragAndDrop/DraggableChipSource.js", () => ({
    DraggableChipSource: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        ParameterControlButton: (props: {
            warningTooltip?: string;
            value?: ParameterValue;
            onClick?: () => void;
        }) => {
            mockCaptured.warningTooltip = props.warningTooltip;
            mockCaptured.value = props.value;
            return <button data-testid="mock-parameter-chip" onClick={props.onClick} />;
        },
    };
});

function renderFilter(renderedParameter: IDashboardParameter = parameter) {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <DashboardParameterFilter parameter={renderedParameter} />
        </RawIntlProvider>,
    );
}

function openDropdown() {
    fireEvent.click(screen.getByTestId("mock-parameter-chip"));
}

function getDropdownInput() {
    return screen.getByTestId("parameter-control-dropdown-input");
}

describe("DashboardParameterFilter", () => {
    beforeEach(() => {
        mockReconciliation = undefined;
        mockCaptured.warningTooltip = undefined;
        mockCaptured.value = undefined;
        mockDispatch.mockReset();
        mockUseDashboardSelector.mockImplementation((selector: unknown) => {
            if (selector === selectCatalogParameterByRef(paramRef)) {
                return workspaceParameter;
            }
            if (selector === selectCatalogParameterByRef(scenarioRef)) {
                return stringWorkspaceParameter;
            }
            if (selector === selectCatalogParameterByRef(enumRef)) {
                return enumWorkspaceParameter;
            }
            if (selector === selectParameterRuntimeOverrideByRef(paramRef)) {
                return 250;
            }
            if (selector === selectParameterRuntimeOverrideByRef(scenarioRef)) {
                return "Budget";
            }
            if (selector === selectParameterRuntimeOverrideByRef(enumRef)) {
                return "budget";
            }
            if (selector === selectParameterReconciliationByRef(paramRef)) {
                return mockReconciliation;
            }
            if (selector === selectIsInEditMode) {
                return false;
            }
            return undefined;
        });
    });

    it("wires the localized warningTooltip when the reconciliation is a reset", () => {
        mockReconciliation = "reset";
        renderFilter();
        expect(mockCaptured.warningTooltip).toBe(RESET_TOOLTIP);
    });

    it.each([undefined, "removed", "incompatible"] as const)(
        "passes no warningTooltip when the reconciliation is %s",
        (reconciliation) => {
            mockReconciliation = reconciliation;
            renderFilter();
            expect(mockCaptured.warningTooltip).toBeUndefined();
        },
    );

    it("renders the number control for a NUMBER parameter", () => {
        renderFilter(activeNumberParameter);
        openDropdown();
        expect(getDropdownInput()).toHaveAttribute("type", "number");
        expect(getDropdownInput()).toHaveValue(250);
    });

    it("renders the free-text control for a STRING parameter", () => {
        renderFilter(activeStringParameter);
        openDropdown();
        expect(getDropdownInput()).toHaveAttribute("type", "text");
        expect(getDropdownInput()).toHaveValue("Budget");
    });

    it("dispatches the typed string as the runtime value on Apply", () => {
        renderFilter(activeStringParameter);
        openDropdown();
        fireEvent.change(getDropdownInput(), { target: { value: "Forecast" } });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-apply"));
        expect(mockDispatch).toHaveBeenCalledWith(
            tabsActions.setParameterRuntimeValue({ ref: scenarioRef, value: "Forecast" }),
        );
    });

    it("renders the enum dropdown with the allowed value titles for a constrained STRING parameter", async () => {
        renderFilter(activeEnumParameter);
        openDropdown();

        expect(screen.getByTestId("parameter-control-allowed-values-dropdown")).toBeInTheDocument();
        const items = await screen.findAllByRole("option");
        expect(items.map((item) => item.textContent)).toEqual(["Actual(Default)", "Budget Plan", "Forecast"]);
    });

    it("dispatches the clicked allowed value's raw value, not its title", async () => {
        renderFilter(activeEnumParameter);
        openDropdown();

        fireEvent.click(await screen.findByText("Forecast"));

        expect(mockDispatch).toHaveBeenCalledWith(
            tabsActions.setParameterRuntimeValue({ ref: enumRef, value: "forecast" }),
        );
    });

    it("shows the allowed value's title on the chip, never the raw value", () => {
        renderFilter(activeEnumParameter);

        expect(mockCaptured.value).toBe("Budget Plan");
    });

    it("shows the allowed value's title on a readonly chip", () => {
        renderFilter({ ...activeEnumParameter, mode: DashboardParameterModeValues.READONLY });

        expect(mockCaptured.value).toBe("Budget Plan");
    });

    it("renders nothing when the workspace parameter type differs from the dashboard parameter type", () => {
        const mismatched: IDashboardParameter = {
            ref: paramRef,
            mode: DashboardParameterModeValues.ACTIVE,
            parameterType: "STRING",
        };
        renderFilter(mismatched);
        expect(screen.queryByTestId("mock-parameter-chip")).not.toBeInTheDocument();
    });
});
