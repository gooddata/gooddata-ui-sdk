// (C) 2019 GoodData Corporation
import {
    bucketIsEmpty,
    bucketMeasures,
    IAttribute,
    IBucket,
    IMeasure,
    IExecutionDefinition,
    isPoPMeasure,
    isPreviousPeriodMeasure,
    measureMasterIdentifier,
    idMatchMeasure,
} from "@gooddata/sdk-model";
import { IDataView, IExecutionResult } from "./index";
import {
    DataValue,
    IDimensionItemDescriptor,
    IMeasureGroupDescriptor,
    IMeasureDescriptor,
    IResultAttributeHeader,
    IDimensionDescriptor,
    IResultHeader,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
} from "./results";
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
export class DataViewFacade {
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

    /**
     * @returns attributes which were specified in execution definition that resulted in this data view
     */
    public attributes(): IAttribute[] {
        return this.dataView.definition.attributes;
    }

    /**
     * @returns measures which were specified in execution definition that resulted in this data view
     */
    public measures(): IMeasure[] {
        return this.dataView.definition.measures;
    }

    //
    // bucket ops
    //

    /**
     * @returns buckets which were specified in execution definition that resulted in this data view; please note that
     *  buckets are an optional metadata included in an execution definition; buckets provide information how different
     *  measures and attributes that make up an execution are logically grouped; therefore keep in mind that it is
     *  completely valid that a data view is populated with data but has no bucket metadata at all.
     */
    public buckets(): IBucket[] {
        return this.dataView.definition.buckets;
    }

    /**
     * Returns bucket by its local identifier.
     *
     * @param localId - desired bucket's local identifier
     * @returns undefined if no such bucket
     */
    public bucket(localId: string): IBucket | undefined {
        if (!localId) {
            return undefined;
        }

        return this._bucketByLocalId[localId];
    }

    /**
     * @returns number of buckets which were specified in execution definition that resulted in this data view
     */
    public bucketCount(): number {
        return this.dataView.definition.buckets.length;
    }

    /**
     * A convenience function that tests whether any buckets were specified in the execution definition that resulted
     * in this data view.
     *
     * @returns true if any buckets, false otherwise
     */
    public hasBuckets(): boolean {
        return this.bucketCount() > 0;
    }

    /**
     * A convenience function that tests whether a bucket is either missing from execution definition that
     * resulted in this data view or the bucket exists and is empty.
     *
     * @param localId - desired bucket's local identifier
     * @returns true if bucket with the provided local identifier both exists and is non empty.
     */
    public isBucketEmpty(localId: string): boolean {
        return bucketIsEmpty(this._bucketByLocalId[localId]);
    }

    /**
     * A convenience function that locates bucket by local identifier and if found returns measures
     * contained in that bucket.
     *
     * @param localId - desired bucket's local identifier
     * @returns array of measures in the bucket, empty array if no such bucket or if the bucket is empty or if
     *  the bucket contains no measures
     */
    public bucketMeasures(localId: string): IMeasure[] {
        return bucketMeasures(this._bucketByLocalId[localId]);
    }

    //
    //
    //

    /**
     * Finds a measure with the provided local identifier within the execution definition that resulted
     * in this data view.
     *
     * @param localId - desired measure's local identifier
     * @returns undefined if no such measure found
     */
    public measure(localId: string): IMeasure | undefined {
        return this.dataView.definition.measures.find(idMatchMeasure(localId));
    }

    /**
     * Finds index of measure with the provided local identifier with the execution definition that
     * resulted in this data view.
     *
     * @param localId - desired measure's local identifier
     * @returns index within list of measures, -1 if no such measure
     */
    public measureIndex(localId: string): number {
        return this.dataView.definition.measures.findIndex(idMatchMeasure(localId));
    }

    /**
     * Given a local identifier of a measure in execution definition, this method will return master measure from which
     * the measure is derived. IF the measure with the provided identifier is not derived, then it itself
     * is returned.
     *
     * @param localId - desired measure's local identifier
     * @returns undefined if no measure with provided local id exists in the execution definition OR if measure exists, it is
     *  derived but master measure does not exist in the execution definition
     */
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

    //
    // attribute ops
    //

    /**
     * @returns true if execution definition that resulted in this data view has any attributes
     */
    public hasAttributes(): boolean {
        return this.dataView.definition.attributes.length > 0;
    }

    //
    // result ops
    //

    /**
     * @returns data view's dimension descriptors
     * @remarks see {@link IDimensionDescriptor} for more information of what this is
     */
    public dimensions(): IDimensionDescriptor[] {
        return this.dataView.result.dimensions;
    }

    /**
     * @param dimIdx - index of dimension
     * @returns dimension item descriptors for desired dimension of the resulting data view
     */
    public dimensionItemDescriptors(dimIdx: number): IDimensionItemDescriptor[] {
        const dim = this.dataView.result.dimensions[dimIdx];

        return dim && dim.headers ? dim.headers : [];
    }

    /**
     * @returns measure group descriptor, regardless of dimension in which it is located
     */
    public measureGroupDescriptor(): IMeasureGroupDescriptor | undefined {
        return this._measureGroupHeader;
    }

    /**
     * This is a convenience function to find measure group descriptor and return its measure descriptors.
     *
     * @returns measure descriptors, empty array if measure group header descriptor is not in any dimension
     */
    public measureDescriptors(): IMeasureDescriptor[] {
        const header = this.measureGroupDescriptor();

        return header ? header.measureGroupHeader.items : [];
    }

    /**
     * Finds measure descriptor by local identifier of the measure from execution definition.
     *
     * @param localId - local identifier of desired measure's descriptor
     * @returns undefined if no measure group header descriptor or no measure descriptor with the provided local identifier
     */
    public measureDescriptor(localId: string): IMeasureDescriptor | undefined {
        return this._measureDescriptorByLocalId[localId];
    }

    /**
     * @returns all headers describing the data included in the data view
     */
    public allHeaders(): IResultHeader[][][] {
        return this.dataView.headerItems;
    }

    /**
     * @returns filters headers for all dimensions so that only attribute headers for the dimensions
     *   are returned
     */
    public attributeHeaders(): IResultAttributeHeader[][][] {
        return this.dataView.headerItems.map((dimension: IResultHeader[][]) => {
            return dimension.filter(headerList =>
                isResultAttributeHeader(headerList[0]),
            ) as IResultAttributeHeader[][];
        });
    }

    /**
     * Tests whether measure descriptor is for a derived measure - that is, the measure is specified in
     * execution definition and is either PoP measure or Previous Period Measure.
     *
     * @param measureDescriptor - input measure descriptor
     * @returns true if measure for the provide measure descriptor is in definition AND is either PoP or previous
     *  period; false otherwise.
     */
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
    // data ops
    //

    /**
     * @returns size for first dimension of the data view
     */
    public firstDimSize(): number {
        return this.dataView.totalCount[0];
    }

    /**
     * @param index - index within first dimension
     * @returns data at index of the first dimension of the data view; if the data view has single dimension
     *  then returns actual data point; if the data view is two dimensional, then returns array
     */
    public dataAt(index: number): DataValue | DataValue[] {
        return this.dataView.data[index];
    }

    /**
     * @returns all data in the data view; this is array of arrays for two dim views or array of data points
     *  for one dimensional data view
     */
    public data(): DataValue[][] | DataValue[] {
        return this.dataView.data;
    }

    /**
     * This is a convenience method that asserts whether data in the data view is one dimensional and if so
     * returns array of data points.
     *
     * @returns array of data points, empty array if there's no data at all
     */
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

    /**
     * This is a convenience method that determines whether the data in the data view is two dimension; if it
     * is then data is returned as-is. If the data is single dimension, this method will up-cast the data to
     * two dimensions.
     *
     * TODO: this method has serious contract issues and inconsistencies; it even borders outright dumb behavior :)
     *   investigation & clean up is a must
     *
     * @returns two dimensional data; if data is empty, returns array with single empty array in
     */
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

    /**
     * @returns grand totals in the data view, undefined if there are no grand totals
     */
    public totals(): DataValue[][][] | undefined {
        return this.dataView.totals;
    }

    /**
     * Tests whether the data view included grand totals.
     *
     * @returns true if grand totals present, false if not
     */
    public hasTotals(): boolean {
        return this.dataView.totals !== undefined;
    }

    /**
     * @returns result of execution which returned this data view
     */
    public result(): IExecutionResult {
        return this.dataView.result;
    }

    /**
     * @remarks see {@link IDataView.fingerprint} for more contractual information
     * @returns fingerprint of the data view
     */
    public fingerprint() {
        return this.dataView.fingerprint;
    }
}
