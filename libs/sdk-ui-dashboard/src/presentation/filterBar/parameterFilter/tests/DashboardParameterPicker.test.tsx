// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IParameterMetadataObject, type IdentifierRef, idRef } from "@gooddata/sdk-model";

import { tabsActions } from "../../../../model/store/tabs/index.js";
import { DashboardParameterPicker } from "../DashboardParameterPicker.js";

const topNRef: IdentifierRef = idRef("topN", "parameter");
const scenarioRef: IdentifierRef = idRef("scenario", "parameter");

const numberParameter: IParameterMetadataObject = {
    type: "parameter",
    id: "topN",
    uri: "/topN",
    ref: topNRef,
    title: "Top N",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "NUMBER", defaultValue: 10 },
};

const stringParameter: IParameterMetadataObject = {
    ...numberParameter,
    id: "scenario",
    uri: "/scenario",
    ref: scenarioRef,
    title: "Scenario",
    definition: { type: "STRING", defaultValue: "Actual" },
};

const mockDispatch = vi.fn();
const pickerCaptured: { onAdd?: (selected: ReadonlyArray<IParameterMetadataObject>) => void } = {};

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => undefined,
    useDashboardDispatch: () => mockDispatch,
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        ParameterPicker: (props: { onAdd: (selected: ReadonlyArray<IParameterMetadataObject>) => void }) => {
            pickerCaptured.onAdd = props.onAdd;
            return null;
        },
    };
});

describe("DashboardParameterPicker", () => {
    it.each([
        ["NUMBER", numberParameter, topNRef, 10],
        ["STRING", stringParameter, scenarioRef, "Actual"],
    ] as const)(
        "adds a %s parameter with its type tag and workspace default",
        (parameterType, workspaceParameter, ref, workspaceDefault) => {
            mockDispatch.mockReset();
            render(<DashboardParameterPicker />);
            pickerCaptured.onAdd!([workspaceParameter]);
            expect(mockDispatch).toHaveBeenCalledWith(
                tabsActions.addParameter({
                    parameter: {
                        ref,
                        parameterType,
                        mode: "active",
                    },
                    workspaceDefault,
                }),
            );
        },
    );
});
