// (C) 2019-2020 GoodData Corporation
import {
    bucketIsEmpty,
    bucketMeasures,
    IAttribute,
    IBucket,
    idMatchMeasure,
    IExecutionDefinition,
    IMeasure,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    measureMasterIdentifier,
} from "@gooddata/sdk-model";
import {
    DataValue,
    IDataView,
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IExecutionResult,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import { IExecutionDefinitionMethods } from "./internal/definitionMethods";
import { IResultMethods } from "./internal/resultMethods";
import { IDataViewMethods } from "./internal/dataViewMethods";
import isArray = require("lodash/isArray");

type BucketIndex = {
    [key: string]: IBucket;
};

type MeasureGroupHeaderIndex = {
    [id: string]: IMeasureDescriptor;
};

function buildBucketIndex(dataView: IDataView): BucketIndex {
    return dataView.definition.buckets.reduce((acc: BucketIndex, val) => {
        const id = val.localIdentifier ? val.localIdentifier : "unknown";
        acc[id] = val;
        return acc;
    }, {});
}

function findMeasureGroupHeader(dataView: IDataView): IMeasureGroupDescriptor | undefined {
    for (const dim of dataView.result.dimensions) {
        const measureGroupHeader = dim.headers.find(isMeasureGroupDescriptor);

        if (measureGroupHeader) {
            return measureGroupHeader;
        }
    }

    return undefined;
}

function buildMeasureHeaderIndex(measureGroup: IMeasureGroupDescriptor | undefined): MeasureGroupHeaderIndex {
    const items =
        measureGroup && measureGroup.measureGroupHeader.items ? measureGroup.measureGroupHeader.items : [];

    return items.reduce((acc: MeasureGroupHeaderIndex, val) => {
        const id = val.measureHeaderItem.localIdentifier;
        acc[id] = val;

        return acc;
    }, {});
}

/**
 * This wrapper for {@link IDataView} provides various convenience methods to work with data and metadata stored inside
 * the provided instance of {@link IDataView}.
 *
 * The facade keeps an ephemeral state - such as calculated indexes on top of the headers in the {@link IDataView} -
 * to optimize performance of often-used lookups at the cost of extra memory.
 *
 * The facade is part of the public API and we strongly recommend to use it whenever client code needs to work with
 * data view; ideally, single instance of data view facade
 *
 * Note: the facade is currently in alpha quality - mix-match of various functions we found useful so far; consolidation
 * and further enhancements will happen, the methods will be removed, renamed and added in the future. The public
 * API WILL break.
 *
 * TODO: move more added-value functions here, clean up, consolidate, modularize
 * @alpha
 */
export class DataViewFacade implements IExecutionDefinitionMethods, IResultMethods, IDataViewMethods {
    public readonly definition: IExecutionDefinition;

    /*
     * Derived property; bucket id => bucket
     */
    private readonly _bucketByLocalId: BucketIndex;

    /*
     * Derived property; measure group header found in dimensions
     */
    private readonly _measureGroupHeader: IMeasureGroupDescriptor | undefined;
    /*
     * Derived property; measure local id => measure group header item
     */
    private readonly _measureDescriptorByLocalId: MeasureGroupHeaderIndex;

    constructor(public readonly dataView: IDataView) {
        this._bucketByLocalId = buildBucketIndex(dataView);
        this._measureGroupHeader = findMeasureGroupHeader(dataView);
        this._measureDescriptorByLocalId = buildMeasureHeaderIndex(this._measureGroupHeader);

        this.definition = dataView.definition;
    }

    //
    // IExecutionDefinitonMethods
    //

    public attributes(): IAttribute[] {
        return this.dataView.definition.attributes;
    }

    public measures(): IMeasure[] {
        return this.dataView.definition.measures;
    }

    public buckets(): IBucket[] {
        return this.dataView.definition.buckets;
    }

    public bucket(localId: string): IBucket | undefined {
        if (!localId) {
            return undefined;
        }

        return this._bucketByLocalId[localId];
    }

    public bucketCount(): number {
        return this.dataView.definition.buckets.length;
    }

    public hasBuckets(): boolean {
        return this.bucketCount() > 0;
    }

    public isBucketEmpty(localId: string): boolean {
        const bucket = this._bucketByLocalId[localId];

        if (!bucket) {
            return true;
        }

        return bucketIsEmpty(this._bucketByLocalId[localId]);
    }

    public bucketMeasures(localId: string): IMeasure[] {
        const bucket = this._bucketByLocalId[localId];

        if (!bucket) {
            return [];
        }

        return bucketMeasures(this._bucketByLocalId[localId]);
    }

    public measure(localId: string): IMeasure | undefined {
        return this.dataView.definition.measures.find(idMatchMeasure(localId));
    }

    public measureIndex(localId: string): number {
        return this.dataView.definition.measures.findIndex(idMatchMeasure(localId));
    }

    public masterMeasureForDerived(localId: string): IMeasure | undefined {
        const measure = this.measure(localId);

        if (!measure) {
            return;
        }

        const masterMeasureId = measureMasterIdentifier(measure);

        if (!masterMeasureId) {
            // TODO: revisit; this is weird but existing callers used to rely on the behavior;
            //  perhaps rename method?

            return measure;
        }

        return this.measure(masterMeasureId);
    }

    public hasAttributes(): boolean {
        return this.dataView.definition.attributes.length > 0;
    }

    //
    // IResultMethods implementation
    //

    public dimensions(): IDimensionDescriptor[] {
        return this.dataView.result.dimensions;
    }

    public dimensionItemDescriptors(dimIdx: number): IDimensionItemDescriptor[] {
        const dim = this.dataView.result.dimensions[dimIdx];

        return dim && dim.headers ? dim.headers : [];
    }

    public measureGroupDescriptor(): IMeasureGroupDescriptor | undefined {
        return this._measureGroupHeader;
    }

    public measureDescriptors(): IMeasureDescriptor[] {
        const header = this.measureGroupDescriptor();

        return header ? header.measureGroupHeader.items : [];
    }

    public measureDescriptor(localId: string): IMeasureDescriptor | undefined {
        return this._measureDescriptorByLocalId[localId];
    }

    public allHeaders(): IResultHeader[][][] {
        return this.dataView.headerItems;
    }

    public attributeHeaders(): IResultAttributeHeader[][][] {
        return this.dataView.headerItems.map((dimension: IResultHeader[][]) => {
            return dimension.filter(headerList =>
                isResultAttributeHeader(headerList[0]),
            ) as IResultAttributeHeader[][];
        });
    }

    public isDerivedMeasure(measureDescriptor: IMeasureDescriptor): boolean {
        const measureIdMatch = idMatchMeasure(measureDescriptor.measureHeaderItem.localIdentifier);

        return this.dataView.definition.measures.some((measure: IMeasure) => {
            if (!measureIdMatch(measure)) {
                return false;
            }

            return isPoPMeasure(measure) || isPreviousPeriodMeasure(measure);
        });
    }

    //
    // IDataViewMethods
    //

    public firstDimSize(): number {
        return this.dataView.totalCount[0];
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

        invariant(
            !isArray(e),
            "trying to work with single-dim data while the underlying data view has two dims",
        );

        return d as DataValue[];
    }

    public twoDimData(): DataValue[][] {
        const d = this.dataView.data;

        if (d === null) {
            return [];
        }

        const e = d[0];

        if (e === null || !e) {
            return [];
        }

        return isArray(e) ? (d as DataValue[][]) : ([d] as DataValue[][]);
    }

    public totals(): DataValue[][][] | undefined {
        return this.dataView.totals;
    }

    public hasTotals(): boolean {
        return this.dataView.totals !== undefined;
    }

    public result(): IExecutionResult {
        return this.dataView.result;
    }

    public fingerprint() {
        return this.dataView.fingerprint;
    }
}
