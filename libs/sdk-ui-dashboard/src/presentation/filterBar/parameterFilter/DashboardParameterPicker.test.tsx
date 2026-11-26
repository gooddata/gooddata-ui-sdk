// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IScalarParameterMetadataObject, type IdentifierRef, idRef } from "@gooddata/sdk-model";

import { addParameters } from "../../../model/commands/parameters.js";
import { selectActiveParameterRefKeys } from "../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectActiveOrDefaultTabLocalIdentifier } from "../../../model/store/tabs/tabsSelectors.js";

import { DashboardParameterPicker } from "./DashboardParameterPicker.js";

const topNRef: IdentifierRef = idRef("topN", "parameter");
const scenarioRef: IdentifierRef = idRef("scenario", "parameter");

const numberParameter: IScalarParameterMetadataObject = {
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

const stringParameter: IScalarParameterMetadataObject = {
    ...numberParameter,
    id: "scenario",
    uri: "/scenario",
    ref: scenarioRef,
    title: "Scenario",
    definition: { type: "STRING", defaultValue: "Actual" },
};

const mockDispatch = vi.fn();
let activeParameterRefKeys: ReadonlySet<string> = new Set();
const pickerCaptured: { onAdd?: (selected: ReadonlyArray<IScalarParameterMetadataObject>) => void } = {};

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => {
        if (selector === selectActiveParameterRefKeys) {
            return activeParameterRefKeys;
        }
        return selector === selectActiveOrDefaultTabLocalIdentifier ? "tab1" : undefined;
    },
    useDashboardDispatch: () => mockDispatch,
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        ParameterPicker: (props: {
            onAdd: (selected: ReadonlyArray<IScalarParameterMetadataObject>) => void;
        }) => {
            pickerCaptured.onAdd = props.onAdd;
            return null;
        },
    };
});

describe("DashboardParameterPicker", () => {
    it("adds the whole selection with one command", () => {
        mockDispatch.mockReset();
        activeParameterRefKeys = new Set();
        render(<DashboardParameterPicker />);
        pickerCaptured.onAdd!([numberParameter, stringParameter]);
        expect(mockDispatch.mock.calls).toEqual([[addParameters([topNRef, scenarioRef], "tab1")]]);
    });

    it("leaves out a selected parameter that is already on the active tab", () => {
        mockDispatch.mockReset();
        activeParameterRefKeys = new Set(["topN"]);
        render(<DashboardParameterPicker />);
        pickerCaptured.onAdd!([numberParameter, stringParameter]);
        expect(mockDispatch.mock.calls).toEqual([[addParameters([scenarioRef], "tab1")]]);
    });
});
