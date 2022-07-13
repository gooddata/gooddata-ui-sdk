// (C) 2019-2022 GoodData Corporation
import {
    IAttribute,
    IMeasure,
    ITotal,
    DataValue,
    IMeasureDescriptor,
    IAttributeDescriptor,
    IResultAttributeHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
} from "@gooddata/sdk-model";

/**
 * @public
 */
export type DataSeriesId = string;

/**
 * @public
 */
export type DataSliceId = string;

/**
 * @public
 */
export type DataPointCoordinates = number[];

/**
 * Data Point represents a value computed for particular data series, possibly sliced for additional
 * set of attribute elements OR possibly being a total.
 *
 * @remarks
 * Technically, DataPoint is the raw data value stored in the data view decorated with all the metadata
 * there exists about that value.
 *
 * @public
 */
export type DataPoint = {
    /**
     * Unformatted value - as provided by the backend.
     */
    readonly rawValue: DataValue;

    /**
     * Formatted value - the raw value transformed according to the format set for the data
     * series to which this point belongs.
     */
    formattedValue(): null | string;

    /**
     * Coordinates into the data view. Coordinates are zero-based.
     */
    readonly coordinates: DataPointCoordinates;

    /**
     * Descriptor of data series to which this data point belongs.
     */
    readonly seriesDesc: DataSeriesDescriptor;

    /**
     * If the data series contains values for different data slices, then the description of the particular
     * slice is included here.
     */
    readonly sliceDesc?: DataSliceDescriptor;

    /**
     * Indicates whether the data point is for a subtotal.
     */
    readonly total?: boolean;
};

//
// Data Series - looking at results _along_ the dimension that contains measures
//

/**
 * @public
 */
export type DataSeriesHeaders = {
    /**
     * Header of the measure whose computed values are in the data series. This header contains the
     * title that is desired for display.
     */
    readonly measureHeader: IResultMeasureHeader;

    /**
     * If the data series measure is further scoped to values pertaining to particular attribute elements,
     * then headers of those elements are listed here.
     *
     * The order of appearance matches the dimension definition of the data view itself.
     */
    readonly attributeHeaders?: IResultAttributeHeader[];
};

/**
 * @public
 */
export type DataSeriesDescriptorMethods = {
    /**
     * @returns - title of measure used to compute the data points
     */
    measureTitle(): string;

    /**
     * @returns - intended format of the measure values; this value is indicated by the backend
     */
    measureFormat(): string;

    /**
     * @remarks
     * Note that the values can actually be null on some backends if your data contains NULL values.
     * We will change the type of this to string | null in the next major (since it is a breaking change),
     * but for now, if you expect NULLs in your data, treat this as string | null already.
     *
     * @returns - titles of attribute elements that are used to scope all data points in this series
     */
    scopeTitles(): string[];
};

/**
 * Full descriptive information about the data series.
 *
 * @public
 */
export type DataSeriesDescriptor = DataSeriesHeaders &
    DataSeriesDescriptorMethods & {
        /**
         * Unique identifier of the data series. This can be used to directly access this data series from data view.
         */
        readonly id: DataSeriesId;

        /**
         * Descriptor of the measure object whose computed values are in the data series. The descriptor
         * contains essential detail about the measure - its name as stored on backend, the intended format
         * for the values and references to the full object metadata.
         */
        readonly measureDescriptor: IMeasureDescriptor;

        /**
         * Definition of the measure whose computed values are in the data series.
         */
        readonly measureDefinition: IMeasure;

        /**
         * Descriptors of attributes whose elements are listed in the headers property. Cardinality of this
         * array is same as cardinality of the headers. For each header in the headers array, this array contains that
         * attribute's descriptor at the same index.
         */
        readonly attributeDescriptors?: IAttributeDescriptor[];

        /**
         * Definitions of attributes whose elements are listed in the headers property. Cardinality of this
         * array is the same as cardinality of the headers and attribute descriptors. For each attribute
         * descriptor in the `attributeDescriptors` array, this array contains that attribute's definition at
         * the same index.
         */
        readonly attributeDefinitions?: IAttribute[];
    };

/**
 * Data series is a sequence of data points that are all computed from a single measure, scoped for
 * particular attribute elements.
 *
 * @remarks
 * In other words, data series allows iterating over two dimensional data view _along_ the dimension which contains
 * the measures (via inclusion of MeasureGroupIdentifier).
 *
 * For convenience, the data series is iterable over Data Points. You can use it either in for-of loop or
 * spread data series into an array of {@link DataPoint | DataPoints}.
 *
 * @public
 */
export interface IDataSeries extends DataSeriesDescriptorMethods, Iterable<DataPoint> {
    /**
     * Unique identifier of the data series. This can be used to directly access this data series from data view.
     */
    readonly id: DataSeriesId;

    /**
     * Descriptor of this data series - what measure it was calculated from, whether it is scoped and if so to what attribute headers.
     */
    readonly descriptor: DataSeriesDescriptor;

    /**
     * @returns - all raw, unformatted data for this series.
     * @remarks if you need to work with fully annotated and formatted data, use the DataPoint iterator.
     */
    rawData(): DataValue[];

    /**
     * @returns - all data points in this series
     * @remarks the series is iterable over data points; if you want to iterate using for-of loop then it is not
     *  necessary to call this method - just use `for (const dataPoint of series) {...}`
     */
    dataPoints(): DataPoint[];
}

/**
 * An iterable collection of data series.
 *
 * @remarks
 * The collection additionally includes basic information about the
 * origin of the data series that can be iterated - their number, measures they were calculated from and
 * the scoping attributes.
 *
 * @public
 */
export interface IDataSeriesCollection extends Iterable<IDataSeries> {
    /**
     * Number of available data series.
     */
    readonly count: number;

    /**
     * Descriptors of measures that are used in the data series.
     *
     * @remarks
     * Note that the number of measures MAY differ from number of data series - that is because the data series may be
     * created for multiple scopes of each measure (e.g. measure X calculated for attribute element A, then same
     * measure calculated for attribute element B etc)
     */
    readonly fromMeasures: IMeasureDescriptor[];

    /**
     * Definitions of measures which were sent to execution and resulted in the data series.
     *
     * @remarks
     * Order of appearance matches the order of appearance in the `fromMeasures` array.
     */
    readonly fromMeasuresDef: IMeasure[];

    /**
     * Descriptors of attributes that are used to create data series with scoped measure values.
     */
    readonly scopingAttributes?: IAttributeDescriptor[];

    /**
     * Definitions of attributes which were sent to execution and resulted in the data series with scoped
     * measure values.
     *
     * @remarks
     * Order of apperance matches the order of appreance in the `scopingAttributes` array.
     */
    readonly scopingAttributesDef?: IAttribute[];

    /**
     * Returns iterator over all data series created for particular measure.
     *
     * @param localIdOrMeasure - local id of measure or measure object to get local id from
     * @returns iterable with no elements
     */
    allForMeasure(localIdOrMeasure: string | IMeasure): Iterable<IDataSeries>;

    /**
     * Returns first-found data series for the provided measure.
     *
     * @remarks
     * This is a 'get-or-die' method and will throw in case data series from the provided measure is not located.
     *
     * @param localIdOrMeasure - local id of measure or measure object to get local id from
     * @returns data series
     * @throws error if no data series or no data series from the provided measure
     */
    firstForMeasure(localIdOrMeasure: string | IMeasure): IDataSeries;

    /**
     * Returns all data series in an array.
     *
     * @remarks
     * Note: if you are looking for a subset of measures, always prefer using the first-class methods
     * {@link IDataSeriesCollection#allForMeasure} and {@link IDataSeriesCollection#firstForMeasure} in favor of getting the array and filtering yourself.
     *
     * @returns empty if no data series
     */
    toArray(): IDataSeries[];
}

//
// Data Slice - looking at results _across_ the dimension that contains the measures
//

/**
 * Data slice name is specified using the result headers.
 *
 * @remarks
 * The headers describe attribute elements (title+ID) for the slice. The slice MAY be for a total calculation,
 * in which case the last header will be for the
 * total.
 *
 * @public
 */
export type DataSliceHeaders = {
    /**
     * Headers of the attribute elements and/or totals for the data slice.
     */
    readonly headers: Array<IResultAttributeHeader | IResultTotalHeader>;

    /**
     * Indicates whether this data slice is a total.
     */
    readonly isTotal?: boolean;
};

/**
 * @public
 */
export type DataSliceDescriptorMethods = {
    /**
     * @returns titles of attribute elements to which this data slice belongs
     *
     * @remarks
     * Note that the values can actually be null on some backends if your data contains NULL values.
     * We will change the type of this to string | null in the next major (since it is a breaking change),
     * but for now, if you expect NULLs in your data, treat this as string | null already.
     */
    readonly sliceTitles: () => string[];
};

/**
 * Full descriptive information of a data slice includes all attribute element and total headers for the slice and
 * next to them descriptors of attribute objects whose elements figure in the headers.
 *
 * @public
 */
export type DataSliceDescriptor = DataSliceHeaders &
    DataSliceDescriptorMethods & {
        /**
         * Unique identifier of the data slice. This can be used to directly access this data slice from data view.
         */
        readonly id: DataSliceId;

        /**
         * Descriptors of attributes whose elements are listed in the headers property.
         *
         * Cardinality of this array is same as cardinality of the headers. For each attribute header in the headers array,
         * this array contains the attribute's descriptor at the same index.
         */
        readonly descriptors: IAttributeDescriptor[];

        /**
         * Definitions of attributes whose elements are listed in the headers property.
         *
         * Cardinality of this array is same as cardinality of the descriptors. For each attribute descriptor in the
         * descriptors array, this array contains the respective attribute's definition at the same index.
         */
        readonly definitions: IAttribute[];
    };

/**
 * Data slice is a sequence of data points that are all computed for a particular attribute elements and/or totals but
 * different data series.
 *
 * @remarks
 * In other words, data slice allows iterating over two dimension data view _across_ the dimension which contains
 * the measures.
 *
 * For convenience, the data slice is iterable over the Data Points. You can use it either in for-of loop or
 * spread data slice into an array of DataPoints.
 *
 * @public
 */
export interface IDataSlice extends DataSliceDescriptorMethods, Iterable<DataPoint> {
    /**
     * Unique identifier of the data slice. This can be used to directly access this data slice from data view.
     */
    readonly id: DataSliceId;

    /**
     * Descriptor of this data slice - what attributes or totals are the data points calculated for.
     */
    readonly descriptor: DataSliceDescriptor;

    /**
     * @returns raw, unformatted data for this slice.
     * @remarks if you need to work with fully annotated and formatted data, use the DataPoint iterator
     */
    rawData(): DataValue[];

    /**
     * @returns - all data points in this slice
     * @remarks the slice is iterable over data points; if you want to iterate using for-of loop then it is not
     *  necessary to call this method - just use `for (const dataPoint of slice) {...}`
     */
    dataPoints(): DataPoint[];
}

/**
 * An iterable collection of data slices.
 *
 * @remarks
 * The collection additionally includes basic information about the
 * origin of the data slices that can be iterated - their number and attributes or totals that were used
 * for slicing.
 *
 * The slices are iterated in the order in which they appear in the underlying results; server side sorting
 * specified at the execution time is thus reflected and honored during the iteration.
 *
 * @public
 */
export interface IDataSliceCollection extends Iterable<IDataSlice> {
    /**
     * Number of available data slices
     */
    readonly count: number;

    /**
     * Descriptors of attributes and/or totals that were used to create data slices.
     */
    readonly descriptors: Array<IAttributeDescriptor | ITotal>;

    /**
     * Returns all data slices in an array.
     *
     * @returns empty if no data slices
     */
    toArray(): IDataSlice[];
}

/**
 * Defines methods to access data in the data view.
 *
 * @remarks
 * These methods and types are recommended in favor of directly accessing the underlying data,
 * headers and descriptors.
 *
 * @public
 */
export interface IDataAccessMethods {
    /**
     * @returns collection of data series that are available in the data view
     */
    series(): IDataSeriesCollection;

    /**
     * @returns collection of data slices that are available in the data view
     */
    slices(): IDataSliceCollection;
}
