// (C) 2026 GoodData Corporation

// @vitest-environment node

import {
    type ColumnState,
    type GridApi,
    type IRowNode,
    type IServerSideGetRowsParams,
    type LoadSuccessParams,
} from "ag-grid-enterprise";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ReferenceMd, ReferenceRecordings } from "@gooddata/reference-workspace";
import { withNormalization } from "@gooddata/sdk-backend-base";
import { compositeBackend, recordedBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IExecutionResult, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type ISortItem, newAttributeSort } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";

import { type AgGridRowData, type ITableColumnDefinitionByColId } from "../../types/internal.js";
import { columnDefinitionToColId } from "../columns/colId.js";

import { createExecutionDef } from "./createExecutionDef.js";
import { createServerSideDataSource } from "./createServerSideDataSource.js";
import { loadDataView } from "./loadDataView.js";
import { getTableData } from "./valueFormatter.js";

const workspace = "reference-workspace";
const backend = compositeBackend({
    workspace,
    backend: withNormalization(recordedBackend(ReferenceRecordings.Recordings)),
});

let realExecutionResult: IExecutionResult;
let initialDataView: DataViewFacade;
let columnDefinitionByColId: ITableColumnDefinitionByColId;

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
    const execution = backend.workspace(workspace).execution().forDefinition(executionDefinition);
    realExecutionResult = await execution.execute();
    initialDataView = await loadDataView({
        executionResult: realExecutionResult,
        startRow: 0,
        endRow: 100,
    });

    columnDefinitionByColId = {};
    getTableData(initialDataView).columnDefinitions.forEach((columnDefinition) => {
        columnDefinitionByColId[columnDefinitionToColId(columnDefinition, "top")] = columnDefinition;
    });
});

interface ISortEmulationJournal {
    executedSorts: ISortItem[][];
    readWindowSorts: ISortItem[][];
}

function notSupported(): never {
    throw new Error("not supported by the sort-emulating test double");
}

// The recordings contain no sorted execution variants, so emulate transform().withSorting().execute()
// on top of the recorded result: a "sorted" result serves the same recorded data as a distinct
// instance and records what was asked of it in the journal.
function emulateResult(
    realResult: IExecutionResult,
    sortBy: ISortItem[],
    journal: ISortEmulationJournal,
): IExecutionResult {
    return {
        definition: { ...realResult.definition, sortBy },
        context: realResult.context,
        dimensions: realResult.dimensions,
        signal: realResult.signal,
        readAll: () => realResult.readAll(),
        readWindow: (offset, size) => {
            journal.readWindowSorts.push(sortBy);
            return realResult.readWindow(offset, size);
        },
        readForecastAll: (config) => realResult.readForecastAll(config),
        readOutliersAll: (config) => realResult.readOutliersAll(config),
        readAnomalyDetectionAll: (config) => realResult.readAnomalyDetectionAll(config),
        readClusteringAll: (config) => realResult.readClusteringAll(config),
        readBinaryStreamAll: (config) => realResult.readBinaryStreamAll(config),
        transform: () => emulatePreparedExecution(realResult, sortBy, journal),
        export: (options) => realResult.export(options),
        equals: (other) => realResult.equals(other),
        fingerprint: () => realResult.fingerprint(),
        resultId: () => realResult.resultId(),
        withSignal: () => notSupported(),
    };
}

function emulatePreparedExecution(
    realResult: IExecutionResult,
    sortBy: ISortItem[],
    journal: ISortEmulationJournal,
): IPreparedExecution {
    const realPrepared = realResult.transform();
    return {
        definition: { ...realPrepared.definition, sortBy },
        signal: realPrepared.signal,
        context: realPrepared.context,
        withSorting: (...items) => emulatePreparedExecution(realResult, items, journal),
        withDimensions: () => notSupported(),
        withBuckets: () => notSupported(),
        withDateFormat: () => notSupported(),
        withExecConfig: () => notSupported(),
        withContext: () => notSupported(),
        withSignal: () => notSupported(),
        explain: () => notSupported(),
        equals: (other) => realPrepared.equals(other),
        fingerprint: () => realPrepared.fingerprint(),
        execute: async () => {
            journal.executedSorts.push(sortBy);
            return emulateResult(realResult, sortBy, journal);
        },
    };
}

function createFakeGridApi(columnState: ColumnState[]): GridApi<AgGridRowData> {
    const partial: Pick<GridApi<AgGridRowData>, "getColumnState" | "setGridOption"> = {
        getColumnState: () => columnState,
        setGridOption: () => {},
    };
    // GridApi has hundreds of members; the data source only touches these two.
    return partial as GridApi<AgGridRowData>;
}

function createGetRowsParams(
    api: GridApi<AgGridRowData>,
    success: (params: LoadSuccessParams<AgGridRowData>) => void,
    fail: () => void,
): IServerSideGetRowsParams<AgGridRowData> {
    // IRowNode has dozens of members; the data source never touches the parent node.
    const parentNode = {} as IRowNode<AgGridRowData>;
    return {
        request: {
            startRow: 0,
            endRow: 100,
            rowGroupCols: [],
            valueCols: [],
            pivotCols: [],
            pivotMode: false,
            groupKeys: [],
            filterModel: null,
            sortModel: [],
        },
        parentNode,
        success,
        fail,
        api,
        context: undefined,
    };
}

function createHarness() {
    const journal: ISortEmulationJournal = { executedSorts: [], readWindowSorts: [] };
    const setCurrentDataView = vi.fn<(dataView: DataViewFacade | undefined) => void>();
    const dataSource = createServerSideDataSource({
        measures: [ReferenceMd.Amount],
        rows: [ReferenceMd.Product.Name],
        sortBy: [],
        columnHeadersPosition: "top",
        grandTotalsPosition: "pinnedBottom",
        columnDefinitionByColId,
        pageSize: 100,
        setCurrentDataView,
        setRuntimeError: vi.fn(),
        setPivotResultColumns: vi.fn(),
        setGrandTotalRows: vi.fn(),
        initSizingForEmptyData: vi.fn(),
        initialExecutionResult: emulateResult(realExecutionResult, [], journal),
        initialDataView,
    });

    async function getRows(columnState: ColumnState[]) {
        const success = vi.fn<(params: LoadSuccessParams<AgGridRowData>) => void>();
        const fail = vi.fn<() => void>();
        await new Promise<void>((resolve) => {
            dataSource.getRows(
                createGetRowsParams(
                    createFakeGridApi(columnState),
                    (params) => {
                        success(params);
                        resolve();
                    },
                    () => {
                        fail();
                        resolve();
                    },
                ),
            );
        });
        // getRows continues synchronously past success() (setCurrentDataView runs before any await),
        // but yield one extra microtask to be safe.
        await Promise.resolve();
        return { success, fail };
    }

    return { getRows, setCurrentDataView, journal };
}

function findAttributeColumn(byColId: ITableColumnDefinitionByColId): {
    colId: string;
    localIdentifier: string;
} {
    for (const [colId, definition] of Object.entries(byColId)) {
        if (definition.type === "attribute") {
            return {
                colId,
                localIdentifier: definition.attributeDescriptor.attributeHeader.localIdentifier,
            };
        }
    }
    throw new Error("no attribute column found in the test fixture");
}

describe("createServerSideDataSource", () => {
    it("serves the pre-loaded initial data view on the first request when there is no active sort", async () => {
        const { getRows, setCurrentDataView, journal } = createHarness();

        const { success, fail } = await getRows([]);

        expect(fail).not.toHaveBeenCalled();
        expect(success).toHaveBeenCalledTimes(1);
        expect(setCurrentDataView).toHaveBeenCalledWith(initialDataView);
        expect(journal.executedSorts).toEqual([]);
        expect(journal.readWindowSorts).toEqual([]);
    });

    it("loads the first page from the sorted execution when a fresh data source sees an active sort", async () => {
        // Reproduces F1-2717: the data source is recreated mid-lifetime (e.g. a conditional
        // formatting change churns column defs) while ag-grid column state still holds the
        // user's sort. The pre-loaded initial data view is unsorted and must NOT be served.
        const { colId, localIdentifier } = findAttributeColumn(columnDefinitionByColId);
        const expectedSort = [newAttributeSort(localIdentifier, "desc")];
        const { getRows, setCurrentDataView, journal } = createHarness();

        const { success, fail } = await getRows([{ colId, sort: "desc" }]);

        expect(fail).not.toHaveBeenCalled();
        expect(success).toHaveBeenCalledTimes(1);
        expect(journal.executedSorts).toEqual([expectedSort]);
        expect(journal.readWindowSorts).toEqual([expectedSort]);
        const servedDataViews = setCurrentDataView.mock.calls.map(([dataView]) => dataView);
        expect(servedDataViews).toHaveLength(1);
        expect(servedDataViews[0]).not.toBe(initialDataView);
    });
});
