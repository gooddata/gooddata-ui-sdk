// (C) 2019 GoodData Corporation
import {
    bucketIsEmpty,
    bucketMeasures,
    IAttribute,
    IBucket,
    IMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    measureMasterIdentifier,
} from "@gooddata/sdk-model";
import { IDataView, IExecutionResult } from "./index";
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
import { IExecutionDefinition } from "./executionDefinition";
import isArray = require("lodash/isArray");

type BucketIndex = {
    [key: string]: IBucket;
};

type MeasureGroupHeaderIndex = {
    [id: string]: IMeasureHeaderItem;
};

function buildBucketIndex(dataView: IDataView): BucketIndex {
    return dataView.definition.buckets.reduce((acc: BucketIndex, val) => {
        const id = val.localIdentifier ? val.localIdentifier : "unknown";
        acc[id] = val;
        return acc;
    }, {});
}

function findMeasureGroupHeader(dataView: IDataView): IMeasureGroupHeader | undefined {
    for (const dim of dataView.result.dimensions) {
        const measureGroupHeader = dim.headers.find(isMeasureGroupHeader);

        if (measureGroupHeader) {
            return measureGroupHeader;
        }
    }

    return undefined;
}

function buildMeasureHeaderIndex(measureGroup: IMeasureGroupHeader | undefined): MeasureGroupHeaderIndex {
    const items =
        measureGroup && measureGroup.measureGroupHeader.items ? measureGroup.measureGroupHeader.items : [];

    return items.reduce((acc: MeasureGroupHeaderIndex, val) => {
        const id = val.measureHeaderItem.localIdentifier;
        acc[id] = val;

        return acc;
    }, {});
}

/**
 * TODO: SDK8: add docs
 * TODO: revisit this class and the functions it provides and how it implements them
 * @public
 */
export class DataViewFacade {
    public readonly definition: IExecutionDefinition;

    /*
     * Derived property; bucket id => bucket
     */
    private readonly _bucketById: BucketIndex;

    /*
     * Derived property; measure group header found in dimensions
     */
    private readonly _measureGroupHeader: IMeasureGroupHeader | undefined;
    /*
     * Derived property; measure local id => measure group header item
     */
    private readonly _measureHeaderById: MeasureGroupHeaderIndex;

    constructor(public readonly dataView: IDataView) {
        this._bucketById = buildBucketIndex(dataView);
        this._measureGroupHeader = findMeasureGroupHeader(dataView);
        this._measureHeaderById = buildMeasureHeaderIndex(this._measureGroupHeader);

        this.definition = dataView.definition;
    }

    public attributes(): IAttribute[] {
        return this.dataView.definition.attributes;
    }

    public measures(): IMeasure[] {
        return this.dataView.definition.measures;
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

        const masterMeasureId = measureMasterIdentifier(measure);

        if (masterMeasureId) {
            return this.measure(masterMeasureId);
        }

        // TODO: revisit; this is weird but existing callers used to rely on the behavior; perhaps rename method?
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

    public headerItems(): IResultHeaderItem[][][] {
        return this.dataView.headerItems;
    }

    public attributeHeaders(): IResultAttributeHeaderItem[][][] {
        return this.dataView.headerItems.map((dimension: IResultHeaderItem[][]) => {
            return dimension.filter(headerList =>
                isResultAttributeHeaderItem(headerList[0]),
            ) as IResultAttributeHeaderItem[][];
        });
    }

    public measureGroupHeader(): IMeasureGroupHeader | undefined {
        return this._measureGroupHeader;
    }

    public measureGroupHeaderItems(): IMeasureHeaderItem[] {
        const header = this.measureGroupHeader();

        return header ? header.measureGroupHeader.items : [];
    }

    public measureGroupHeaderItem(id: string): IMeasureHeaderItem | undefined {
        return this._measureHeaderById[id];
    }

    public isDerivedMeasure(measureHeader: IMeasureHeaderItem): boolean {
        return this.dataView.definition.measures.some((measure: IMeasure) => {
            if (measure.measure.localIdentifier !== measureHeader.measureHeaderItem.localIdentifier) {
                return false;
            }

            return isPoPMeasure(measure) || isPreviousPeriodMeasure(measure);
        });
    }

    //
    // data ops
    //

    public firstDimSize(): number {
        return this.dataView.totalCount[0];
    }

    public secondDimSize(): number {
        return this.dataView.totalCount[1];
    }

    public dataAt(index: number): DataValue | DataValue[] {
        return this.dataView.data[index];
    }

    public data(): DataValue[][] | DataValue[] {
        return this.dataView.data;
    }

    public singleDimData(): DataValue[] {
        const d = this.dataView.data;

        if (d === null) {
            return [];
        }

        const e = d[0];

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

    public result(): IExecutionResult {
        return this.dataView.result;
    }

    public fingerprint() {
        return this.dataView.fingerprint;
    }
}
