// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IDashboardExportParameter } from "@gooddata/sdk-model";

import { selectConfig } from "../../model/store/config/configSelectors.js";
import { selectDashboardDescriptor } from "../../model/store/meta/metaSelectors.js";
import { selectIsInExportMode } from "../../model/store/renderMode/renderModeSelectors.js";
import { selectActiveTabExportParameters } from "../../model/store/tabs/parameters/parametersSelectors.js";
import { type DashboardSelector } from "../../model/store/types.js";

vi.mock("../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn(),
}));

vi.mock("./hooks/useDashboardRelatedFilters.js", () => ({
    useDashboardRelatedFilters: () => ({
        dateFilters: [],
        attributeFilters: [],
        measureValueFilters: [],
        isLoading: false,
        isError: false,
        isSuccess: true,
    }),
}));

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";

import { DefaultDashboardExportVariables } from "./DefaultDashboardExportVariables.js";

// Scoping lives in the selector (tested separately); here we drive its output.
function mockSelectors(parameters: IDashboardExportParameter[]): void {
    const values = new Map<DashboardSelector<unknown>, unknown>([
        [selectIsInExportMode, true],
        [selectActiveTabExportParameters, parameters],
        [selectConfig, {}],
        [selectDashboardDescriptor, {}],
    ]);
    vi.mocked(useDashboardSelector).mockImplementation((selector) => values.get(selector));
}

function parameterEntries(container: HTMLElement): { name: string; value: string; status: string | null }[] {
    return Array.from(container.querySelectorAll('[data-export-meta-filter-type="parameter"]')).map(
        (node) => ({
            name: node.querySelector('[data-export-meta-type="dashboard-filter-name"]')?.textContent ?? "",
            value: node.querySelector('[data-export-meta-type="dashboard-filter-value"]')?.textContent ?? "",
            // export-builder blocks on this per entry; missing/loading would hang the export.
            status: node.getAttribute("data-export-meta-filter-status"),
        }),
    );
}

describe("DefaultDashboardExportVariables", () => {
    it("renders active parameter overrides as ready entries in the filters block", () => {
        mockSelectors([{ id: "topn", title: "Top N", value: "5" }]);

        const { container } = render(<DefaultDashboardExportVariables renderMode="export" />);

        expect(parameterEntries(container)).toEqual([{ name: "Top N", value: "5", status: "loaded" }]);
    });

    it("renders no parameter entries when there are no active overrides", () => {
        mockSelectors([]);

        const { container } = render(<DefaultDashboardExportVariables renderMode="export" />);

        expect(parameterEntries(container)).toHaveLength(0);
    });

    it("renders nothing outside export mode", () => {
        mockSelectors([{ id: "topn", title: "Top N", value: "5" }]);

        const { container } = render(<DefaultDashboardExportVariables renderMode="view" />);

        expect(container.firstChild).toBeNull();
    });
});
