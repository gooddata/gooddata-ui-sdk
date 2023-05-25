// (C) 2019-2023 GoodData Corporation

import { IDataView } from "@gooddata/sdk-backend-spi";
import {
    DataValue,
    IResultAttributeHeader,
    IResultTotalHeader,
    isResultTotalHeader,
    resultHeaderName,
} from "@gooddata/sdk-model";
import {
    DataPoint,
    DataSeriesDescriptor,
    DataSliceDescriptor,
    IDataSeries,
    IDataSlice,
} from "../dataAccess.js";
import { createDataAccessDigest, DataAccessDigest } from "./dataAccessDigest.js";
import { LazyInitArray } from "./lazyInitArray.js";
import { invariant, InvariantError } from "ts-invariant";
import { getTotalInfo, measureFormat, measureName } from "./utils.js";
import { DataAccessConfig } from "../dataAccessConfig.js";
import partial from "lodash/partial.js";
import isArray from "lodash/isArray.js";

type DataWithCoordinates = { rawValue: DataValue; coordinates: number[] };

type StateAccessors = {
    rawData: (idx: number) => DataValue[];
    dataAt: (idx: number, seq?: number) => DataWithCoordinates;
    seriesDescriptors: (idx: number) => DataSeriesDescriptor;
    sliceDescriptors: (idx: number) => DataSliceDescriptor;
};

/**
 * Iterates over single-dimensional result and returns values as data points.
 */
class SingleDimIterator implements Iterator<DataPoint> {
    private returned: boolean;

    constructor(
        private readonly seriesIdx: number,
        private readonly accessors: StateAccessors,
        private readonly config: DataAccessConfig,
    ) {
        this.returned = false;
    }

    public next = (): IteratorYieldResult<DataPoint> | IteratorReturnResult<any> => {
        if (this.returned) {
            return {
                done: true,
                value: undefined,
            };
        }

        /*
         * Set series and slices indexes accordingly. If iterator is over series, then base
         * is index of series and offset is index of slice. Similar for slice..
         */
        const { rawValue, coordinates } = this.accessors.dataAt(this.seriesIdx);
        const { valueFormatter } = this.config;
        const seriesDesc = this.accessors.seriesDescriptors(this.seriesIdx);
        const measureFormat = seriesDesc.measureFormat();

        this.returned = true;

        return {
            done: false,
            value: {
                rawValue,
                seriesDesc,
                coordinates,
                total: false,
                formattedValue(): string | null {
                    return valueFormatter(rawValue, measureFormat);
                },
            },
        };
    };
}

/**
 * Iterates over two-dimensional data and returns values as data points.
 */
class TwoDimIterator implements Iterator<DataPoint> {
    private offset: number;
    private readonly offsetEnd: number;

    constructor(
        private readonly type: "series" | "slice",
        private readonly baseIdx: number,
        private readonly digest: DataAccessDigest,
        private readonly accessors: StateAccessors,
        private readonly config: DataAccessConfig,
    ) {
        this.offset = 0;

        if (this.type === "series") {
            this.offsetEnd = this.digest.slices!.count;
        } else {
            this.offsetEnd = this.digest.series!.count;
        }
    }

    public next = (): IteratorYieldResult<DataPoint> | IteratorReturnResult<any> => {
        if (this.offset >= this.offsetEnd) {
            return {
                done: true,
                value: undefined,
            };
        }

        /*
         * Set series and slices indexes accordingly. If iterator is over series, then base
         * is index of series and offset is index of slice. Similar for type "slice".
         */
        const seriesIdx = this.type === "series" ? this.baseIdx : this.offset;
        const sliceIdx = this.type === "slice" ? this.baseIdx : this.offset;
        const { rawValue, coordinates } = this.accessors.dataAt(this.baseIdx, this.offset);
        const { valueFormatter } = this.config;
        const seriesDesc = this.accessors.seriesDescriptors(seriesIdx);
        const sliceDesc = this.accessors.sliceDescriptors(sliceIdx);
        const measureFormat = seriesDesc.measureFormat();

        this.offset += 1;

        return {
            done: false,
            value: {
                rawValue,
                seriesDesc,
                sliceDesc,
                coordinates,
                total: sliceDesc.isTotal,
                formattedValue(): string | null {
                    return valueFormatter(rawValue, measureFormat);
                },
            },
        };
    };
}

class DataSeries implements IDataSeries {
    public readonly id: string;
    public readonly descriptor: DataSeriesDescriptor;
    private rawDataValues: DataValue[] | undefined;
    private dataPointsArray: DataPoint[] | undefined;

    constructor(
        private readonly seriesIdx: number,
        private readonly digest: DataAccessDigest,
        private readonly accessors: StateAccessors,
        private readonly config: DataAccessConfig,
    ) {
        this.descriptor = this.accessors.seriesDescriptors(this.seriesIdx);
        this.id = this.descriptor.id;
    }

    public measureFormat = (): string => {
        return this.descriptor.measureFormat();
    };

    public measureTitle = (): string => {
        return this.descriptor.measureTitle();
    };

    public scopeTitles = (): (string | null)[] => {
        return this.descriptor.scopeTitles();
    };

    public rawData = (): DataValue[] => {
        if (!this.rawDataValues) {
            this.rawDataValues = this.accessors.rawData(this.seriesIdx);
        }

        return this.rawDataValues;
    };

    public dataPoints = (): DataPoint[] => {
        if (!this.dataPointsArray) {
            this.dataPointsArray = Array.from(this);
        }

        return this.dataPointsArray;
    };

    public [Symbol.iterator] = (): Iterator<DataPoint> => {
        const { slices } = this.digest;

        /*
         * Note here: code accounts for two invariants:
         *
         * 1. truly a single-dim result - data is array of values
         * 2. weird single-dim result - the slices dimension is empty, contains no attributes to slice by. in that case
         *    the data view is an array-in-array. the result is essentially single-dimensional however is wrapped
         *    in another array. the dataAt accessor impl can handle this
         */
        if (slices === undefined || (slices.dimIdx >= 0 && slices.count === 0)) {
            return new SingleDimIterator(this.seriesIdx, this.accessors, this.config);
        }

        return new TwoDimIterator("series", this.seriesIdx, this.digest, this.accessors, this.config);
    };
}

class DataSlice implements IDataSlice {
    public readonly id: string;
    public readonly descriptor: DataSliceDescriptor;

    private rawDataValues: DataValue[] | undefined;
    private dataPointsArray: DataPoint[] | undefined;

    constructor(
        private readonly sliceIdx: number,
        private readonly digest: DataAccessDigest,
        private readonly accessors: StateAccessors,
        private readonly config: DataAccessConfig,
    ) {
        this.descriptor = this.accessors.sliceDescriptors(this.sliceIdx);
        this.id = this.descriptor.id;
    }

    public sliceTitles = (): (string | null)[] => {
        return this.descriptor.sliceTitles();
    };

    public rawData = (): DataValue[] => {
        if (!this.rawDataValues) {
            this.rawDataValues = this.accessors.rawData(this.sliceIdx);
        }

        return this.rawDataValues;
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    public dataPoints = (): DataPoint[] => {
        if (!this.dataPointsArray) {
            this.dataPointsArray = Array.from(this);
        }

        return this.dataPointsArray;
    };

    public [Symbol.iterator] = (): Iterator<DataPoint> => {
        if (!this.digest.series) {
            /*
             * If there are no data series, there are no measures and therefore there
             * are no data points to iterate over.
             */
            return [][Symbol.iterator]();
        }

        return new TwoDimIterator("slice", this.sliceIdx, this.digest, this.accessors, this.config);
    };
}

function illegalState(message: string) {
    return () => {
        throw new InvariantError(message);
    };
}

/**
 * This class holds the underlying implementation of data access methods. The code is designed to follow
 * lazy initialization principles. The various data structures (slices, series, their descriptors etc) are
 * only created when needed.
 *
 * The responsibilities of this class is to operate on top of digest & data stored in the data view and
 * from information therein create descriptors for series, slices and then series and slices itself. It also
 * makes access to underlying data transparent - hiding the detail whether series and slices have their
 * data organized in row→col or col→row.
 */
export class DataAccessImpl {
    private readonly dataView: IDataView;
    private readonly config: DataAccessConfig;
    private readonly digest: DataAccessDigest;
    private readonly seriesDescriptors: LazyInitArray<DataSeriesDescriptor>;
    private readonly slicesDescriptors: LazyInitArray<DataSliceDescriptor>;
    private readonly series: LazyInitArray<IDataSeries>;
    private readonly slices: LazyInitArray<IDataSlice>;
    private readonly accessors: StateAccessors[];

    constructor(dataView: IDataView, config: DataAccessConfig) {
        this.dataView = dataView;
        this.config = config;

        this.digest = createDataAccessDigest(this.dataView);

        const { series, slices } = this.digest;

        const seriesCount = series?.count ?? 0;
        const slicesCount = slices?.count ?? 0;

        this.seriesDescriptors = new LazyInitArray<DataSeriesDescriptor>(
            seriesCount,
            this.createDataSeriesDescriptor,
        );
        this.series = new LazyInitArray<IDataSeries>(seriesCount, this.createDataSeries);
        this.slicesDescriptors = new LazyInitArray<DataSliceDescriptor>(
            slicesCount,
            this.createDataSliceDescriptor,
        );
        this.slices = new LazyInitArray<IDataSlice>(slicesCount, this.createDataSlice);

        this.accessors = [
            {
                rawData: series
                    ? partial(this.getRawData, series.dimIdx)
                    : illegalState("there are no data series"),
                dataAt: series
                    ? partial(this.getDataAt, series.dimIdx)
                    : illegalState("there are no data series"),
                seriesDescriptors: this.seriesDescriptors.get,
                sliceDescriptors: this.slicesDescriptors.get,
            },
            {
                rawData: slices
                    ? partial(this.getRawData, slices.dimIdx)
                    : illegalState("there are no data slices"),
                dataAt: slices
                    ? partial(this.getDataAt, slices.dimIdx)
                    : illegalState("there are no data slices"),
                seriesDescriptors: this.seriesDescriptors.get,
                sliceDescriptors: this.slicesDescriptors.get,
            },
        ];
    }

    public getDataAccessPointers = (): DataAccessDigest => {
        return this.digest;
    };

    public getDataSeriesIterator = (): Iterator<IDataSeries> => {
        return this.series[Symbol.iterator]();
    };

    public getDataSlicesIterator = (): Iterator<IDataSlice> => {
        return this.slices[Symbol.iterator]();
    };

    public getDataSeries = (idx: number): IDataSeries => {
        return this.series.get(idx);
    };

    public findDataSeriesIndexes = (localId: string): number[] => {
        const { series: seriesDigest } = this.digest;

        if (!seriesDigest) {
            return [];
        }

        return seriesDigest.measureIndexes[localId] || [];
    };

    private getRawData = (fromDimIdx: number, idx: number): DataValue[] => {
        if (fromDimIdx === 1) {
            /*
             * Need to extract data from particular columns of two-dim data. Go through all rows, from
             * each row take value at the desired column's index.
             */
            return (this.dataView.data as DataValue[][]).map((row) => {
                return row[idx];
            });
        } else {
            /*
             * Either extracting row from two-dim result or extracting single value from one-dim result
             */

            const value = this.dataView.data[idx];

            if (isArray(value)) {
                /*
                 * Two-dim result, return as-is
                 */
                return value;
            } else {
                /*
                 * Single-dim result, return wrapped
                 */

                return [value];
            }
        }
    };

    private getDataAt = (fromDimIdx: number, idx: number, seq: number = 0): DataWithCoordinates => {
        if (fromDimIdx === 1) {
            /*
             * Want data from column. Get `idx` column value in of `seq` row
             */
            const twoDimData = this.dataView.data as DataValue[][];

            return { rawValue: twoDimData[seq][idx], coordinates: [seq, idx] };
        } else {
            const value = this.dataView.data[idx];

            if (isArray(value)) {
                return { rawValue: value[seq], coordinates: [idx, seq] };
            } else {
                invariant(seq === 0, "trying to get row-col from single dim result");

                return { rawValue: value, coordinates: [idx] };
            }
        }
    };

    private createDataSeriesDescriptor = (seriesIdx: number): DataSeriesDescriptor => {
        const { series: seriesDigest } = this.digest;

        invariant(seriesDigest, "trying to create data series descriptor when there are no data series");

        const {
            fromMeasures,
            fromMeasuresDef,
            measureHeaders,
            allAttributeHeaders,
            scopingAttributes,
            scopingAttributesDef,
        } = seriesDigest;

        const measureHeader = measureHeaders[seriesIdx];
        let measureIndex = measureHeader?.measureHeaderItem?.order || 0;
        if (isResultTotalHeader(measureHeader)) {
            // total headers are mixed with measure headers, linking to measure index
            measureIndex = measureHeader?.totalHeaderItem?.measureIndex || 0;
        }

        const attributeHeaders = allAttributeHeaders.map((headers) => headers[seriesIdx]);
        const measureDescriptor = fromMeasures[measureIndex];
        const measureDefinition = fromMeasuresDef[measureIndex];
        const { headerTranslator } = this.config;

        const { isTotal, isSubtotal } = getTotalInfo(attributeHeaders);

        return {
            id: `${seriesIdx}`,
            measureDescriptor,
            measureDefinition,
            attributeDescriptors: scopingAttributes,
            attributeDefinitions: scopingAttributesDef,
            measureHeader,
            attributeHeaders,
            isTotal,
            isSubtotal,
            measureFormat: (): string => {
                return measureFormat(measureDescriptor);
            },
            measureTitle: (): string => {
                return measureName(measureDescriptor);
            },
            scopeTitles: (): Array<string | null> => {
                if (!headerTranslator) {
                    return attributeHeaders.map(resultHeaderName);
                }

                return attributeHeaders.map((h) => headerTranslator(resultHeaderName(h)));
            },
        };
    };

    private createDataSliceDescriptor = (sliceIdx: number): DataSliceDescriptor => {
        const { slices: slicesDigest } = this.digest;

        invariant(slicesDigest, "trying to create data slice descriptor when there are no data slices");

        const { descriptors, headerItems, descriptorsDef } = slicesDigest;
        const headers: Array<IResultAttributeHeader | IResultTotalHeader> = [];
        const { headerTranslator } = this.config;

        let total: boolean = false;

        headerItems.forEach((h) => {
            const header: IResultAttributeHeader | IResultTotalHeader = h[sliceIdx] as any;

            headers.push(header);

            if (isResultTotalHeader(header)) {
                total = true;
            }
        });

        return {
            id: `${sliceIdx}`,
            descriptors,
            definitions: descriptorsDef,
            headers,
            isTotal: total,
            sliceTitles: (): Array<string | null> => {
                if (!headerTranslator) {
                    return headers.map(resultHeaderName);
                }

                return headers.map((h) => headerTranslator(resultHeaderName(h)));
            },
        };
    };

    private createDataSeries = (seriesIdx: number): IDataSeries => {
        return new DataSeries(seriesIdx, this.digest, this.accessors[0], this.config);
    };

    private createDataSlice = (sliceIdx: number): IDataSlice => {
        return new DataSlice(sliceIdx, this.digest, this.accessors[1], this.config);
    };
}
