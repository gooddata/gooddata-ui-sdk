// (C) 2019 GoodData Corporation
import {
    bucketIsEmpty,
    bucketMeasures,
    IBucket,
    IMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    SortItem,
    IDimension,
} from "@gooddata/sdk-model";
import { NotSupported } from "../errors";
import { IExportConfig, IExportResult } from "../export";
import { defFingerprint, defWithDimensions, defWithSorts, IExecutionDefinition } from "./executionDefinition";
import { DimensionGenerator, IDataView, IExecutionResult, IPreparedExecution, toDimensions } from "./index";
import {
    DataValue,
    IMeasureGroupHeader,
    IMeasureHeaderItem,
    IResultAttributeHeaderItem,
    IResultDimension,
    IResultHeaderItem,
    isMeasureGroupHeader,
    isResultAttributeHeaderItem,
} from "./results";
import isArray = require("lodash/isArray");

type BucketIndex = {
    [key: string]: IBucket;
};

/**
 * TODO: SDK8: add docs
 * TODO: revisit this class and the functions it provides and how it implements them
 * @public
 */
export class DataViewFacade {
    private readonly _bucketById: BucketIndex;

    constructor(private dataView: IDataView) {
        this._bucketById = dataView.definition.buckets.reduce((acc: BucketIndex, val) => {
            const id = val.localIdentifier ? val.localIdentifier : "unknown";
            acc[id] = val;
            return acc;
        }, {});
    }

    //
    // bucket ops
    //

    public buckets(): IBucket[] {
        return this.dataView.definition.buckets;
    }

    public bucket(id: string): IBucket | undefined {
        return this._bucketById[id];
    }

    public bucketCount(): number {
        return this.dataView.definition.buckets.length;
    }

    public hasBuckets(): boolean {
        return this.bucketCount() > 0;
    }

    public isBucketEmpty(id: string): boolean {
        return !this._bucketById[id] || bucketIsEmpty(this._bucketById[id]);
    }

    public bucketMeasures(id: string): IMeasure[] {
        const bucket = this._bucketById[id];

        return bucket ? bucketMeasures(bucket) : [];
    }

    //
    //
    //
    public measure(id: string): IMeasure | undefined {
        return this.dataView.definition.measures.find(m => m.measure.localIdentifier === id);
    }

    public measureIndex(id: string): number {
        return this.dataView.definition.measures.findIndex(m => m.measure.localIdentifier === id);
    }

    public masterMeasureForDerived(id: string): IMeasure | undefined {
        const measure = this.measure(id);

        if (!measure) {
            return;
        }

        if (isPoPMeasure(measure)) {
            return this.measure(measure.measure.definition.popMeasureDefinition.measureIdentifier);
        } else if (isPreviousPeriodMeasure(measure)) {
            return this.measure(measure.measure.definition.previousPeriodMeasure.measureIdentifier);
        }

        return measure;
    }

    public hasMeasures(): boolean {
        return this.dataView.definition.measures.length > 0;
    }

    //
    // attribute ops
    //

    public hasAttributes(): boolean {
        return this.dataView.definition.attributes.length > 0;
    }

    //
    // header ops
    //

    public dimensions(): IResultDimension[] {
        return this.dataView.result.dimensions;
    }

    public attributeHeaders(): IResultAttributeHeaderItem[][][] {
        return this.dataView.headerItems.map((dimension: IResultHeaderItem[][]) => {
            return dimension.filter(headerList =>
                isResultAttributeHeaderItem(headerList[0]),
            ) as IResultAttributeHeaderItem[][];
        });
    }

    public measureGroupHeader(): IMeasureGroupHeader | undefined {
        for (const dim of this.dataView.result.dimensions) {
            const measureGroupHeader = dim.headers.find(isMeasureGroupHeader);

            if (measureGroupHeader) {
                return measureGroupHeader;
            }
        }

        return;
    }

    public measureGroupHeaderItems(): IMeasureHeaderItem[] {
        const header = this.measureGroupHeader();

        return header ? header.measureGroupHeader.items : [];
    }

    public measureGroupHeaderItem(id: string): IMeasureHeaderItem | undefined {
        return this.measureGroupHeaderItems().find(i => i.measureHeaderItem.localIdentifier === id);
    }

    public isDerivedMeasure(measureHeader: IMeasureHeaderItem): boolean {
        return this.dataView.definition.measures.some((measure: IMeasure) => {
            if (measure.measure.localIdentifier !== measureHeader.measureHeaderItem.localIdentifier) {
                return false;
            }

            const definition = measure.measure.definition;

            return isPoPMeasure(definition) || isPreviousPeriodMeasure(definition);
        });
    }

    //
    // data ops
    //

    public data(): DataValue[][] | DataValue[] {
        return this.dataView.data;
    }

    public singleDimData(): DataValue[] {
        const d = this.dataView.data;

        if (d === null) {
            return [];
        }

        const e = d[0];

        if (e === null || !e) {
            return [];
        }

        if (isArray(e)) {
            // TODO: SDK8: switch to invariant?
            throw new Error();
        }

        return d as DataValue[];
    }

    public twoDimData(): DataValue[][] {
        const d = this.dataView.data;

        if (d === null) {
            return [[]];
        }

        const e = d[0];

        if (e === null || !e) {
            return [[]];
        }

        return isArray(e) ? (d as DataValue[][]) : ([d] as DataValue[][]);
    }

    public fingerprint() {
        return this.dataView.fingerprint;
    }
}

//
// Functions to support testing code that works with the facade
// TODO: move to separate test support package and use as dev dependency
//
const nullPromise: Promise<null> = new Promise(r => r(null));
const noop: (..._: any[]) => Promise<null> = _ => nullPromise;

/**
 * Creates a new, empty data view facade for the provided execution definition. The definition will be
 * retained as-is. The data will be empty.
 * @param definition
 */
export function testingFacade(definition: IExecutionDefinition): DataViewFacade {
    return new DataViewFacade(emptyDataView(definition));
}

function emptyDataView(definition: IExecutionDefinition, result?: IExecutionResult): IDataView {
    const execResult = result ? result : emptyResult(definition);

    const fp = defFingerprint(definition) + "/emptyView";

    return {
        definition,
        result: execResult,
        headerItems: [[[]]],
        data: [[]],
        offset: [0, 0],
        count: [0, 0],
        advance: noop,
        pageDown: noop,
        pageUp: noop,
        pageLeft: noop,
        pageRight: noop,
        fingerprint(): string {
            return fp;
        },
        equals(other: IDataView): boolean {
            return fp === other.fingerprint();
        },
    };
}

function emptyResult(definition: IExecutionDefinition): IExecutionResult {
    const fp = defFingerprint(definition) + "/emptyResult";
    const result: IExecutionResult = {
        definition,
        dimensions: [],
        readAll(): Promise<IDataView> {
            return new Promise(r => r(emptyDataView(definition, result)));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return new Promise(r => r(emptyDataView(definition, result)));
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IExecutionResult): boolean {
            return fp === other.fingerprint();
        },
        export(_: IExportConfig): Promise<IExportResult> {
            throw new NotSupported("...");
        },
        transform(): IPreparedExecution {
            return testPreparedExecution(definition);
        },
    };

    return result;
}

function testPreparedExecution(definition: IExecutionDefinition): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return testPreparedExecution(defWithDimensions(definition, toDimensions(dim, definition)));
        },
        withSorting(...items: SortItem[]): IPreparedExecution {
            return testPreparedExecution(defWithSorts(definition, items));
        },
        execute(): Promise<IExecutionResult> {
            return new Promise(_ => emptyResult(definition));
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return fp === other.fingerprint();
        },
    };
}
