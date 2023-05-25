// (C) 2019-2022 GoodData Corporation

import {
    IDataAccessMethods,
    IDataSeries,
    IDataSeriesCollection,
    IDataSlice,
    IDataSliceCollection,
} from "../dataAccess.js";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { DataAccessImpl } from "./dataAccessImpl.js";
import { DataAccessConfig, DefaultDataAccessConfig } from "../dataAccessConfig.js";
import {
    IMeasure,
    IAttribute,
    ITotal,
    measureLocalId,
    IMeasureDescriptor,
    IAttributeDescriptor,
} from "@gooddata/sdk-model";

class FilteredIterator<T> implements Iterator<T> {
    private idx = 0;

    constructor(private readonly indexes: number[], private readonly itemProvider: (idx: number) => T) {}

    public next = (): IteratorYieldResult<T> | IteratorReturnResult<any> => {
        if (this.idx >= this.indexes.length) {
            return {
                done: true,
                value: undefined,
            };
        }

        const value: T = this.itemProvider(this.indexes[this.idx]);
        this.idx += 1;

        return {
            done: false,
            value,
        };
    };
}

class DataSeriesCollection implements IDataSeriesCollection {
    public readonly count: number = 0;
    public readonly fromMeasures: IMeasureDescriptor[] = [];
    public readonly fromMeasuresDef: IMeasure[] = [];
    public readonly scopingAttributes: IAttributeDescriptor[] = [];
    public readonly scopingAttributesDef: IAttribute[] = [];

    constructor(private readonly dataAccess: DataAccessImpl) {
        const seriesDigest = this.dataAccess.getDataAccessPointers().series;

        if (!seriesDigest) {
            return;
        }

        this.count = seriesDigest.count;
        this.fromMeasures = seriesDigest.fromMeasures;
        this.fromMeasuresDef = seriesDigest.fromMeasuresDef;
        this.scopingAttributes = seriesDigest.scopingAttributes;
        this.scopingAttributesDef = seriesDigest.scopingAttributesDef;
    }

    public [Symbol.iterator] = (): Iterator<IDataSeries> => {
        return this.dataAccess.getDataSeriesIterator();
    };

    public allForMeasure = (localIdOrMeasure: string | IMeasure): Iterable<IDataSeries> => {
        if (!this.count) {
            return [];
        }

        const localId =
            typeof localIdOrMeasure === "string" ? localIdOrMeasure : measureLocalId(localIdOrMeasure);
        const indexes = this.dataAccess.findDataSeriesIndexes(localId);

        if (!indexes.length) {
            return [];
        }

        return {
            [Symbol.iterator]: (): Iterator<IDataSeries> => {
                return new FilteredIterator(indexes, this.dataAccess.getDataSeries);
            },
        };
    };

    public firstForMeasure = (localIdOrMeasure: string | IMeasure): IDataSeries => {
        if (!this.count) {
            throw new Error("there are no data series");
        }

        const localId =
            typeof localIdOrMeasure === "string" ? localIdOrMeasure : measureLocalId(localIdOrMeasure);
        const indexes = this.dataAccess.findDataSeriesIndexes(localId);

        if (!indexes.length) {
            throw new Error(`there are no data series for measure with local id: ${localId}`);
        }

        return this.dataAccess.getDataSeries(indexes[0]);
    };

    public toArray = (): IDataSeries[] => {
        return Array.from(this);
    };
}

class DataSliceCollection implements IDataSliceCollection {
    public readonly count: number = 0;
    public readonly descriptors: Array<IAttributeDescriptor | ITotal> = [];

    constructor(private readonly dataAccess: DataAccessImpl) {
        const slicesDigest = this.dataAccess.getDataAccessPointers().slices;

        if (!slicesDigest) {
            return;
        }

        this.count = slicesDigest.count;
        this.descriptors = slicesDigest.descriptors;
    }

    public [Symbol.iterator] = (): Iterator<IDataSlice> => {
        return this.dataAccess.getDataSlicesIterator();
    };

    public toArray = (): IDataSlice[] => {
        return Array.from(this);
    };
}

class DataAccessMethods implements IDataAccessMethods {
    private readonly dataAccess: DataAccessImpl;
    private readonly seriesCollection: IDataSeriesCollection;
    private readonly slicesCollection: IDataSliceCollection;

    constructor(dataView: IDataView, config: DataAccessConfig) {
        this.dataAccess = new DataAccessImpl(dataView, config);
        this.seriesCollection = new DataSeriesCollection(this.dataAccess);
        this.slicesCollection = new DataSliceCollection(this.dataAccess);
    }

    public series(): IDataSeriesCollection {
        return this.seriesCollection;
    }

    public slices(): IDataSliceCollection {
        return this.slicesCollection;
    }
}

/**
 * @internal
 */
export function newDataAccessMethods(
    dataView: IDataView,
    config: DataAccessConfig = DefaultDataAccessConfig,
): IDataAccessMethods {
    return new DataAccessMethods(dataView, config);
}
