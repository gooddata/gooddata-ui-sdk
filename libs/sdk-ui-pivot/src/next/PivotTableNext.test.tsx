// (C) 2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { AG_GRID_MOCK_TEST_ID, resetCapturedAgGridProps } from "../testUtils/agGridReactMock.fixture.js";

import { createExecutionDef } from "./features/data/createExecutionDef.js";
import { PivotTableNextImplementation } from "./PivotTableNext.js";
import { type ICorePivotTableNextProps } from "./types/internal.js";

/*
 * The real grid needs a layouted DOM, so it is replaced by a marker element. The mock lives in a shared
 * module because the suite runs without isolation - see the notes in `agGridReactMock.tsx`.
 */
vi.mock("ag-grid-react", () => import("../testUtils/agGridReactMock.fixture.js"));

const workspace = "reference-workspace";

const executionDefinition = createExecutionDef({
    workspace,
    columns: [],
    rows: [ReferenceMd.Product.Name],
    measures: [ReferenceMd.Amount],
    filters: [],
    sortBy: [],
    totals: [],
    measureGroupDimension: "columns",
    execConfig: {},
});

const recordedDataBackend = compositeBackend({
    workspace,
    backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
});

// No recordings at all, so every execution is rejected - this drives the component into its error branch.
const noDataBackend = recordedBackend({});

function buildProps(backend: IAnalyticalBackend): ICorePivotTableNextProps {
    return {
        execution: backend.workspace(workspace).execution().forDefinition(executionDefinition),
        locale: "en-US",
        measures: [ReferenceMd.Amount],
        rows: [ReferenceMd.Product.Name],
        columns: [],
    };
}

describe("PivotTableNext smoke test", () => {
    beforeEach(() => {
        resetCapturedAgGridProps();
    });

    it("should render default loading component while the initial execution is pending", () => {
        const { container } = render(<PivotTableNextImplementation {...buildProps(recordedDataBackend)} />);

        expect(container.querySelector(".s-loading")).toBeInTheDocument();
        expect(screen.queryByTestId(AG_GRID_MOCK_TEST_ID)).not.toBeInTheDocument();
    });

    it("should render table container once the initial execution succeeds", async () => {
        render(<PivotTableNextImplementation {...buildProps(recordedDataBackend)} />);

        expect(await screen.findByTestId(AG_GRID_MOCK_TEST_ID)).toBeInTheDocument();
    });

    it("should render error component when the initial execution fails", async () => {
        const { container } = render(<PivotTableNextImplementation {...buildProps(noDataBackend)} />);

        await waitFor(() => expect(container.querySelector(".s-error")).toBeInTheDocument());
        expect(screen.queryByTestId(AG_GRID_MOCK_TEST_ID)).not.toBeInTheDocument();
    });
});
