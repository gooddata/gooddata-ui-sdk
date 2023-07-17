// (C) 2019-2023 GoodData Corporation
import * as GdcExecution from "@gooddata/api-model-bear/GdcExecution";
import * as GdcExport from "@gooddata/api-model-bear/GdcExport";

import { transformResultHeaders } from "@gooddata/sdk-backend-base";
import {
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    NoDataError,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    IExecutionDefinition,
    DataValue,
    IDimensionDescriptor,
    IResultHeader,
    IResultWarning,
    bucketsMeasures,
    bucketsFind,
    isAttribute,
    isResultMeasureHeader,
    isTotalDescriptor,
    ITotal,
    TotalType,
} from "@gooddata/sdk-model";
import SparkMD5 from "spark-md5";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { convertExecutionApiError } from "../../../utils/errorHandling.js";
import { toAfmExecution } from "../../../convertors/toBackend/afm/ExecutionConverter.js";
import {
    convertWarning,
    convertDimensions,
} from "../../../convertors/fromBackend/ExecutionResultConverter.js";
import { createResultHeaderTransformer } from "../../../convertors/fromBackend/afm/result.js";
import { findDateAttributeUris } from "../../../convertors/dateFormatting/dateFormatter.js";

interface IIndexedTotals {
    [key: string]: ITotal[];
}

interface IIndexedTotalIterator {
    [key: string]: number;
}

const TOTAL_ORDER: TotalType[] = ["sum", "max", "min", "avg", "med", "nat"];

export class BearExecutionResult implements IExecutionResult {
    public readonly dimensions: IDimensionDescriptor[];
    private readonly _fingerprint: string;

    constructor(
        private readonly authApiCall: BearAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly execFactory: IExecutionFactory,
        private readonly execResponse: GdcExecution.IExecutionResponse,
    ) {
        this.dimensions = convertDimensions(execResponse.dimensions);
        this._fingerprint = SparkMD5.hash(execResponse.links.executionResult);
    }

    public async readAll(): Promise<IDataView> {
        return this.asDataView(
            this.authApiCall(
                (sdk) => sdk.execution.getExecutionResult(this.execResponse.links.executionResult),
                convertExecutionApiError,
            ),
        );
    }

    public async readWindow(offset: number[], size: number[]): Promise<IDataView> {
        const saneOffset = sanitizeOffset(offset);
        const saneSize = sanitizeSize(size);

        return this.asDataView(
            this.authApiCall(
                (sdk) =>
                    sdk.execution.getPartialExecutionResult(
                        this.execResponse.links.executionResult,
                        saneSize,
                        saneOffset,
                    ),
                convertExecutionApiError,
            ),
        );
    }

    public transform(): IPreparedExecution {
        return this.execFactory.forDefinition(this.definition);
    }

    public async export(options: IExportConfig): Promise<IExportResult> {
        const optionsForBackend = this.buildExportOptions(options);
        return this.authApiCall((sdk) =>
            sdk.report.exportResult(
                this.definition.workspace,
                this.execResponse.links.executionResult,
                optionsForBackend,
            ),
        );
    }

    private buildExportOptions(options: IExportConfig): GdcExport.IExportConfig {
        const optionsForBackend: GdcExport.IExportConfig = {
            format: options.format,
            mergeHeaders: options.mergeHeaders,
            title: options.title,
            showFilters: options.showFilters,
        };

        if (options.showFilters) {
            optionsForBackend.afm = toAfmExecution(this.definition).execution.afm;
        }

        return optionsForBackend;
    }

    public equals(other: IExecutionResult): boolean {
        return this.fingerprint() === other.fingerprint();
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    private asDataView: DataViewFactory = (promisedRes) => {
        return promisedRes.then((res) => {
            if (!res) {
                // TODO: SDK8: investigate when can this actually happen; perhaps end of data during paging?
                //  perhaps legitimate NoDataCase?
                throw new UnexpectedError("Server returned no data");
            }

            if (isEmptyDataResult(res)) {
                throw new NoDataError(
                    "The execution resulted in no data to display.",
                    new BearDataView(this, res),
                );
            }

            return new BearDataView(this, res);
        });
    };
}

const BEAR_PAGE_SIZE_LIMIT = 1000;

function sanitizeOffset(offset: number[]): number[] {
    return offset.map((offsetItem = 0) => offsetItem);
}

function sanitizeSize(size: number[]): number[] {
    return size.map((sizeInDim = BEAR_PAGE_SIZE_LIMIT) => {
        if (sizeInDim > BEAR_PAGE_SIZE_LIMIT) {
            console.warn("The maximum limit per page is " + BEAR_PAGE_SIZE_LIMIT);

            return BEAR_PAGE_SIZE_LIMIT;
        }
        return sizeInDim;
    });
}

type DataViewFactory = (promisedRes: Promise<GdcExecution.IExecutionResult | null>) => Promise<IDataView>;

// for each level (column attribute), prepare a set of totals corresponding for that level
function separateTotalsByLevels(columnTotals: ITotal[], columnIdentifiers: string[]): IIndexedTotals {
    return columnTotals.reduce((acc: IIndexedTotals, total: ITotal) => {
        const index = columnIdentifiers.indexOf(total.attributeIdentifier);
        if (index !== -1) {
            return {
                ...acc,
                [index]: [...(acc[index] ?? []), total],
            };
        }

        return acc;
    }, {});
}

// for each of the indexed totals levels, initiate iterator at 0 for measure iteration
function initiateTotalsIterators(indexedTotals: IIndexedTotals): IIndexedTotalIterator {
    return Object.keys(indexedTotals).reduce((acc, key) => {
        return {
            ...acc,
            [key]: 0,
        };
    }, {});
}

// sometimes the order inside dimensions is not guaranteed so we need to sort the totals on each level by measure order
// (happens during adding measure, removing measure, changing measures order)
function fixTotalOrderByMeasuresOrder(
    indexedTotals: { [key: string]: ITotal[] },
    measuresIdentifiers: string[],
): { [key: string]: ITotal[] } {
    return Object.keys(indexedTotals).reduce((acc, key) => {
        const current: ITotal[] = [...indexedTotals[key]];
        current.sort((a: ITotal, b: ITotal) => {
            const totComparison = TOTAL_ORDER.indexOf(a.type) - TOTAL_ORDER.indexOf(b.type);
            if (totComparison !== 0) return totComparison;

            return (
                measuresIdentifiers.indexOf(a.measureIdentifier) -
                measuresIdentifiers.indexOf(b.measureIdentifier)
            );
        });
        return {
            ...acc,
            [key]: current,
        };
    }, {});
}

function preprocessTotalHeaderItems(
    headerItems: IResultHeader[][][],
    definition: IExecutionDefinition,
): IResultHeader[][][] {
    const columnTotals = definition?.dimensions[1]?.totals;
    if (!columnTotals?.length) {
        // noop when no column totals are present
        return headerItems;
    }

    const buckets = definition.buckets;
    const measures = bucketsMeasures(buckets);
    const columns = bucketsFind(buckets, "columns")?.items || [];
    const columnIdentifiers = columns.filter(isAttribute).map((item) => item.attribute?.localIdentifier);
    const measuresIdentifiers = measures.map((m) => m.measure.localIdentifier);

    // separate totals for each level and initiate iterators for them
    const indexedTotalsUnordered = separateTotalsByLevels(columnTotals, columnIdentifiers);
    const indexedTotals = fixTotalOrderByMeasuresOrder(indexedTotalsUnordered, measuresIdentifiers);
    const indexedTotalsIterators = initiateTotalsIterators(indexedTotals);

    return headerItems.map((topHeaderItems) => {
        // nesting level of the total; used to determine level of totals to use.
        const nesting: number[] = [];
        return topHeaderItems.map((items) => {
            // process only header items with measures
            // now, nesting info should already be up-to-date as measures are processed last
            if (items.find(isResultMeasureHeader)) {
                return items.map((item, itemIdx) => {
                    if (isTotalDescriptor(item)) {
                        // for each total item, we need to determine on which level the total is defined
                        // (use nesting info built previously when iterating other levels) and
                        // use measure lookups for totals defined on correct levels.
                        const itemLevel = Math.max(0, columnIdentifiers.length - nesting[itemIdx]);
                        const currentIteratorValue = indexedTotalsIterators[itemLevel];
                        const correspondingTotal = indexedTotals[itemLevel][currentIteratorValue];
                        const totalMeasure = correspondingTotal?.measureIdentifier;
                        const totalMeasureIndex = measuresIdentifiers.indexOf(totalMeasure);
                        const measureIndex = Math.max(totalMeasureIndex, 0);
                        const result = {
                            ...item,
                            totalHeaderItem: {
                                ...item?.totalHeaderItem,
                                measureIndex,
                            },
                        };

                        indexedTotalsIterators[itemLevel] =
                            (currentIteratorValue + 1) % indexedTotals[itemLevel].length;
                        return result;
                    }

                    return item;
                });
            }

            items.forEach((item, index) => {
                nesting[index] = nesting[index] ?? 0;
                if (isTotalDescriptor(item)) {
                    nesting[index] = nesting[index] + 1;
                }
            });

            return items;
        });
    });
}

class BearDataView implements IDataView {
    public readonly data: DataValue[][] | DataValue[];
    public readonly definition: IExecutionDefinition;
    public readonly headerItems: IResultHeader[][][];
    public readonly totalCount: number[];
    public readonly count: number[];
    public readonly offset: number[];
    public readonly result: IExecutionResult;
    public readonly totals?: DataValue[][][];
    public readonly totalTotals?: DataValue[][][];
    public readonly warnings?: IResultWarning[];
    private readonly _fingerprint: string;

    constructor(result: IExecutionResult, dataResult: GdcExecution.IExecutionResult) {
        this.result = result;
        this.definition = result.definition;
        this.data = dataResult.data;
        this.headerItems = dataResult.headerItems ? dataResult.headerItems : [];
        this.totals = dataResult.totals;
        this.totalTotals = dataResult.totalTotals;
        this.totalCount = dataResult.paging.total;
        this.count = dataResult.paging.count;
        this.offset = dataResult.paging.offset;
        this.warnings = dataResult.warnings?.map(convertWarning) ?? [];

        this._fingerprint = `${result.fingerprint()}/${this.offset.join(",")}-${this.count.join(",")}`;

        this.headerItems = preprocessTotalHeaderItems(this.headerItems, this.definition);
        this.headerItems = transformResultHeaders(
            this.headerItems,
            createResultHeaderTransformer(findDateAttributeUris(result.dimensions)),
            this.definition.postProcessing,
        );
    }

    public fingerprint(): string {
        return this._fingerprint;
    }

    public equals(other: IDataView): boolean {
        return this.fingerprint() === other.fingerprint();
    }
}

//
//
//

function hasEmptyData(result: GdcExecution.IExecutionResult): boolean {
    return result.data.length === 0;
}

function hasMissingHeaderItems(result: GdcExecution.IExecutionResult): boolean {
    return !result.headerItems;
}

function isEmptyDataResult(result: GdcExecution.IExecutionResult): boolean {
    return hasEmptyData(result) && hasMissingHeaderItems(result);
}
