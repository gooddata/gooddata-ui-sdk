// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { render } from "@testing-library/react";
import { RawIntlProvider } from "react-intl";
import { beforeAll, describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IExecutionResult, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type DataViewFacade, createIntlMock } from "@gooddata/sdk-ui";

import { createExecutionDef } from "../features/data/createExecutionDef.js";
import { loadDataView } from "../features/data/loadDataView.js";
import {
    type IConditionalFormatting,
    type PivotTableNextConditionalFormattingConfig,
} from "../types/conditionalFormatting.js";
import { type ICorePivotTableNextProps } from "../types/internal.js";
import { type PivotTableNextConfig } from "../types/public.js";

import { ColumnDefsProvider, useColumnDefs } from "./ColumnDefsContext.js";
import { DrillableItemsRefProvider } from "./DrillableItemsRefContext.js";
import { InitialExecutionContextProvider } from "./InitialExecutionContext.js";
import { PivotTablePropsProvider } from "./PivotTablePropsContext.js";

const workspace = "reference-workspace";
const backend = compositeBackend({
    workspace,
    backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
});

const intl = createIntlMock();

let execution: IPreparedExecution;
let initialExecutionResult: IExecutionResult;
let initialDataView: DataViewFacade;

beforeAll(async () => {
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
    execution = backend.workspace(workspace).execution().forDefinition(executionDefinition);
    initialExecutionResult = await execution.execute();
    initialDataView = await loadDataView({
        executionResult: initialExecutionResult,
        startRow: 0,
        endRow: 100,
    });
});

function buildProps(conditionalFormatting: IConditionalFormatting | undefined): ICorePivotTableNextProps {
    const config: PivotTableNextConfig & PivotTableNextConditionalFormattingConfig = {
        conditionalFormatting,
    };
    return {
        execution,
        measures: [ReferenceMd.Amount],
        rows: [ReferenceMd.Product.Name],
        config,
    };
}

function Harness({ props, children }: { props: ICorePivotTableNextProps; children: ReactNode }) {
    return (
        <RawIntlProvider value={intl}>
            <PivotTablePropsProvider {...props}>
                <InitialExecutionContextProvider
                    initialExecutionResult={initialExecutionResult}
                    initialDataView={initialDataView}
                >
                    <DrillableItemsRefProvider>
                        <ColumnDefsProvider>{children}</ColumnDefsProvider>
                    </DrillableItemsRefProvider>
                </InitialExecutionContextProvider>
            </PivotTablePropsProvider>
        </RawIntlProvider>
    );
}

function CaptureColumnDefinitionByColId({ onRender }: { onRender: (byColId: unknown) => void }) {
    const { columnDefinitionByColId } = useColumnDefs();
    onRender(columnDefinitionByColId);
    return null;
}

describe("ColumnDefsContext conditional-formatting wiring", () => {
    it("recomputes columnDefinitionByColId when conditionalFormatting content changes", () => {
        const captured: unknown[] = [];

        const { rerender } = render(
            <Harness props={buildProps({ enabled: true, rules: [] })}>
                <CaptureColumnDefinitionByColId onRender={(v) => captured.push(v)} />
            </Harness>,
        );

        rerender(
            <Harness props={buildProps({ enabled: false, rules: [] })}>
                <CaptureColumnDefinitionByColId onRender={(v) => captured.push(v)} />
            </Harness>,
        );

        expect(new Set(captured).size).toBeGreaterThan(1);
    });
});
