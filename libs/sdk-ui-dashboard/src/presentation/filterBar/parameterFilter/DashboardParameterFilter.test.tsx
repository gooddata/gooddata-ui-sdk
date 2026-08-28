// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
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
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { tabsActions } from "../../../model/store/tabs/index.js";
import { type ParameterReconciliation } from "../../../model/store/tabs/parameters/parametersHelpers.js";
import {
    selectParameterDisplayValueByRef,
    selectParameterReconciliationByRef,
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
let mockIsApplyAllAtOnce = false;
let mockStagedValue: ParameterValue | undefined;
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

function renderFilter(renderedParameter: IDashboardParameter = parameter) {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <DashboardParameterFilter parameter={renderedParameter} />
        </RawIntlProvider>,
    );
}

function openDropdown(name: string) {
    fireEvent.click(screen.getByRole("button", { name }));
}

function getDropdownInput() {
    return screen.getByTestId("parameter-control-dropdown-input");
}

describe("DashboardParameterFilter", () => {
    beforeEach(() => {
        mockReconciliation = undefined;
        mockIsApplyAllAtOnce = false;
        mockStagedValue = undefined;
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
            if (selector === selectParameterDisplayValueByRef(paramRef)) {
                return mockStagedValue ?? 250;
            }
            if (selector === selectParameterDisplayValueByRef(scenarioRef)) {
                return mockStagedValue ?? "Budget";
            }
            if (selector === selectParameterDisplayValueByRef(enumRef)) {
                return mockStagedValue ?? "budget";
            }
            if (selector === selectParameterReconciliationByRef(paramRef)) {
                return mockReconciliation;
            }
            if (selector === selectIsApplyFiltersAllAtOnceEnabledAndSet) {
                return mockIsApplyAllAtOnce;
            }
            if (selector === selectIsInEditMode) {
                return false;
            }
            return undefined;
        });
    });

    it("shows the localized reset warning when the reconciliation is a reset", async () => {
        mockReconciliation = "reset";
        renderFilter();
        act(() => {
            screen.getByRole("button", { name: "Top N is 250" }).focus();
        });
        expect(await screen.findByRole("tooltip")).toHaveTextContent(RESET_TOOLTIP);
    });

    it.each([undefined, "removed", "incompatible"] as const)(
        "shows no warning when the reconciliation is %s",
        (reconciliation) => {
            mockReconciliation = reconciliation;
            renderFilter();
            expect(screen.getByRole("button", { name: "Top N is 250" })).not.toHaveAttribute(
                "aria-describedby",
            );
        },
    );

    it("renders the number control for a NUMBER parameter", () => {
        renderFilter(activeNumberParameter);
        openDropdown("Top N is 250");
        expect(getDropdownInput()).toHaveAttribute("type", "number");
        expect(getDropdownInput()).toHaveValue(250);
    });

    it("renders the free-text control for a STRING parameter", () => {
        renderFilter(activeStringParameter);
        openDropdown("Scenario is Budget");
        expect(getDropdownInput()).toHaveAttribute("type", "text");
        expect(getDropdownInput()).toHaveValue("Budget");
    });

    it("dispatches the typed string as the runtime value on Apply", () => {
        renderFilter(activeStringParameter);
        openDropdown("Scenario is Budget");
        fireEvent.change(getDropdownInput(), { target: { value: "Forecast" } });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-apply"));
        expect(mockDispatch).toHaveBeenCalledWith(
            tabsActions.setParameterRuntimeValue({ ref: scenarioRef, value: "Forecast" }),
        );
    });

    it("dispatches the working value instead of the runtime value on Apply under apply-all-at-once", () => {
        mockIsApplyAllAtOnce = true;
        renderFilter(activeStringParameter);
        openDropdown("Scenario is Budget");
        fireEvent.change(getDropdownInput(), { target: { value: "Forecast" } });
        fireEvent.click(screen.getByTestId("parameter-control-dropdown-apply"));
        expect(mockDispatch).toHaveBeenCalledWith(
            tabsActions.setParameterWorkingValue({ ref: scenarioRef, value: "Forecast" }),
        );
    });

    it("shows the staged value on the parameter control and in the dropdown", () => {
        mockStagedValue = "Staged";
        renderFilter(activeStringParameter);
        openDropdown("Scenario is Staged");
        expect(getDropdownInput()).toHaveValue("Staged");
    });

    it("renders the enum dropdown with the allowed value titles for a constrained STRING parameter", async () => {
        renderFilter(activeEnumParameter);
        openDropdown("Scenario is Budget Plan");

        expect(screen.getByTestId("parameter-control-allowed-values-dropdown")).toBeInTheDocument();
        const items = await screen.findAllByRole("option");
        expect(items.map((item) => item.textContent)).toEqual(["Actual(Default)", "Budget Plan", "Forecast"]);
    });

    it("dispatches the clicked allowed value's raw value, not its title", async () => {
        renderFilter(activeEnumParameter);
        openDropdown("Scenario is Budget Plan");

        fireEvent.click(await screen.findByText("Forecast"));

        expect(mockDispatch).toHaveBeenCalledWith(
            tabsActions.setParameterRuntimeValue({ ref: enumRef, value: "forecast" }),
        );
    });

    it("shows the allowed value's title on the button, never the raw value", () => {
        renderFilter(activeEnumParameter);
        expect(screen.getByRole("button", { name: "Scenario is Budget Plan" })).toBeInTheDocument();
    });

    it("shows the allowed value's title on a readonly button", () => {
        renderFilter({ ...activeEnumParameter, mode: DashboardParameterModeValues.READONLY });
        expect(screen.getByRole("button", { name: "Scenario is Budget Plan" })).toBeInTheDocument();
    });

    it("renders nothing when the workspace parameter type differs from the dashboard parameter type", () => {
        const mismatched: IDashboardParameter = {
            ref: paramRef,
            mode: DashboardParameterModeValues.ACTIVE,
            parameterType: "STRING",
        };
        renderFilter(mismatched);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
});
