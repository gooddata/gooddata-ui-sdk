// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DashboardParameterModeValues, type IParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import { selectCatalogParameterByRef } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectDashboardParameterEntryByRef } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { type IDashboardParameterEntry } from "../../../../model/store/tabs/parameters/parametersState.js";
import { createInternalIntl } from "../../../localization/createInternalIntl.js";
import { DefaultParameterDraggingComponent } from "../DefaultParameterDraggingComponent.js";

const enumRef = idRef("scenario", "parameter");
const numberRef = idRef("topN", "parameter");

const enumWorkspaceParameter: IParameterMetadataObject = {
    type: "parameter",
    id: "scenario",
    uri: "/scenario",
    ref: enumRef,
    title: "Scenario",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: {
        type: "STRING",
        defaultValue: "actual",
        constraints: {
            allowedValues: [
                { value: "actual", title: "Actual" },
                { value: "budget", title: "Budget Plan" },
            ],
        },
    },
};

const numberWorkspaceParameter: IParameterMetadataObject = {
    ...enumWorkspaceParameter,
    id: "topN",
    uri: "/topN",
    ref: numberRef,
    title: "Top N",
    definition: { type: "NUMBER", defaultValue: 10 },
};

const enumEntry: IDashboardParameterEntry = {
    parameter: { ref: enumRef, mode: DashboardParameterModeValues.ACTIVE, parameterType: "STRING" },
    runtimeOverride: "budget",
};

const numberEntry: IDashboardParameterEntry = {
    parameter: { ref: numberRef, mode: DashboardParameterModeValues.ACTIVE, parameterType: "NUMBER" },
    runtimeOverride: 250,
};

const mockUseDashboardSelector = vi.fn();

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
}));

function renderPreview(
    entry: IDashboardParameterEntry,
    workspaceParameter: IParameterMetadataObject | undefined,
) {
    mockUseDashboardSelector.mockImplementation((selector: unknown) => {
        if (selector === selectDashboardParameterEntryByRef(entry.parameter.ref)) {
            return entry;
        }
        if (selector === selectCatalogParameterByRef(entry.parameter.ref)) {
            return workspaceParameter;
        }
        return undefined;
    });
    return render(
        <RawIntlProvider value={createInternalIntl()}>
            <DefaultParameterDraggingComponent
                itemType="parameter"
                item={{ type: "parameter", ref: entry.parameter.ref }}
            />
        </RawIntlProvider>,
    );
}

describe("DefaultParameterDraggingComponent", () => {
    it("labels the dragged chip with the allowed value's title, never the raw value", () => {
        renderPreview(enumEntry, enumWorkspaceParameter);

        expect(screen.getByText("Scenario")).toBeInTheDocument();
        expect(screen.getByText("is Budget Plan")).toBeInTheDocument();
        expect(screen.queryByText("is budget")).not.toBeInTheDocument();
    });

    it("labels the dragged chip with the value itself for a NUMBER parameter", () => {
        renderPreview(numberEntry, numberWorkspaceParameter);

        expect(screen.getByText("is 250")).toBeInTheDocument();
    });

    it("renders nothing when the workspace parameter is missing, like the filter bar chip", () => {
        const { container } = renderPreview(enumEntry, undefined);

        expect(container).toBeEmptyDOMElement();
    });

    it("renders nothing when the workspace parameter type differs, like the filter bar chip", () => {
        const { container } = renderPreview(enumEntry, numberWorkspaceParameter);

        expect(container).toBeEmptyDOMElement();
    });
});
