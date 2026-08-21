// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";

import {
    AG_GRID_MOCK_TEST_ID,
    capturedAgGridProps,
    resetCapturedAgGridProps,
} from "../../testUtils/agGridReactMock.js";

import { createExecutionDef } from "./features/data/createExecutionDef.js";
import { type IPivotTableExecutionDefinition } from "./features/data/executionDefinition/types.js";
import { PivotTableNextImplementation } from "./PivotTableNext.js";
import {
    type IConditionalFormatting,
    type PivotTableNextConfigWithConditionalFormatting,
} from "./types/conditionalFormatting.js";
import { type ICorePivotTableNextProps } from "./types/internal.js";

/*
 * The grid is replaced by a marker element that records the props it was rendered with. The mock lives in
 * a shared module because the suite runs without isolation - see the notes in `agGridReactMock.tsx`.
 */
vi.mock("ag-grid-react", () => import("../../testUtils/agGridReactMock.js"));

const workspace = "reference-workspace";
const backend = compositeBackend({
    workspace,
    backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
});

let executionDefinition: IPivotTableExecutionDefinition;

beforeAll(() => {
    executionDefinition = createExecutionDef({
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
});

beforeEach(() => {
    resetCapturedAgGridProps();
});

// Rebuilds every field AD churns each render (fresh refs, equal content). Callbacks are omitted on
// purpose: they are stable in the pluggable, so churning them here would fail the test for a non-bug.
function buildProps(conditionalFormatting: IConditionalFormatting | undefined): ICorePivotTableNextProps {
    const config: PivotTableNextConfigWithConditionalFormatting = {
        conditionalFormatting,
        textWrapping: { wrapText: true },
    };
    return {
        execution: backend.workspace(workspace).execution().forDefinition(executionDefinition),
        locale: "en-US",
        measures: [ReferenceMd.Amount],
        rows: [ReferenceMd.Product.Name],
        columns: [],
        filters: [],
        totals: [],
        sortBy: [],
        drillableItems: [],
        config,
    };
}

describe("server-side data source identity", () => {
    it("is not recreated when all props/config are rebuilt fresh-but-deeply-equal across a re-render", async () => {
        const { rerender } = render(
            <PivotTableNextImplementation {...buildProps({ enabled: true, rules: [] })} />,
        );
        await screen.findByTestId(AG_GRID_MOCK_TEST_ID);

        rerender(<PivotTableNextImplementation {...buildProps({ enabled: true, rules: [] })} />);
        await screen.findByTestId(AG_GRID_MOCK_TEST_ID);

        const datasources = capturedAgGridProps.map((props) => props.serverSideDatasource).filter(Boolean);
        expect(datasources.length).toBeGreaterThanOrEqual(2);
        expect(new Set(datasources).size).toBe(1);
    });
});
