// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    DashboardParameterModeValues,
    type IDashboardParameter,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

import { selectCatalogParameterByRef } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectIsInEditMode } from "../../../../model/store/renderMode/renderModeSelectors.js";
import { type ParameterReconciliation } from "../../../../model/store/tabs/parameters/parametersHelpers.js";
import {
    selectParameterReconciliationByRef,
    selectParameterRuntimeOverrideByRef,
} from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { createInternalIntl } from "../../../localization/createInternalIntl.js";
import { DashboardParameterFilter } from "../DashboardParameterFilter.js";

const paramRef = idRef("topN", "parameter");

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

const parameter: IDashboardParameter = {
    ref: paramRef,
    mode: DashboardParameterModeValues.READONLY,
    parameterType: "NUMBER",
    value: 250,
};

const RESET_TOOLTIP =
    "The original value is out of range, so the default is applied until you set a valid value.";

let mockReconciliation: ParameterReconciliation | undefined;
const mockCaptured: { warningTooltip?: string } = {};
const mockUseDashboardSelector = vi.fn();

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => () => {},
}));

vi.mock("../../../dragAndDrop/DraggableChipSource.js", () => ({
    DraggableChipSource: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        ParameterControlButton: (props: { warningTooltip?: string }) => {
            mockCaptured.warningTooltip = props.warningTooltip;
            return null;
        },
    };
});

function renderFilter() {
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <DashboardParameterFilter parameter={parameter} />
        </RawIntlProvider>,
    );
}

describe("DashboardParameterFilter", () => {
    beforeEach(() => {
        mockReconciliation = undefined;
        mockCaptured.warningTooltip = undefined;
        mockUseDashboardSelector.mockImplementation((selector: unknown) => {
            if (selector === selectCatalogParameterByRef(paramRef)) {
                return workspaceParameter;
            }
            if (selector === selectParameterRuntimeOverrideByRef(paramRef)) {
                return 250;
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
});
