// (C) 2019-2020 GoodData Corporation

import {
    IDataAccessMethods,
    IDataSeries,
    IDataSeriesCollection,
    IDataSlice,
    IDataSliceCollection,
} from "../dataAccess";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { DataAccessImpl } from "./dataAccessImpl";
import { createNumberJsFormatter, DataAccessConfig } from "../dataAccessConfig";

function createDataSeriesCollection(dataAccess: DataAccessImpl): IDataSeriesCollection {
    const {
        fromMeasures = [],
        fromMeasuresDef = [],
        scopingAttributes = [],
        scopingAttributesDef = [],
        count = 0,
    } = dataAccess.getDataAccessPointers().series ?? {};

    return {
        fromMeasures,
        fromMeasuresDef,
        scopingAttributes,
        scopingAttributesDef,
        count,

        [Symbol.iterator]: (): Iterator<IDataSeries> => {
            return dataAccess.getDataSeriesIterator();
        },
    };
}

function createDataSlicesCollection(dataAccess: DataAccessImpl): IDataSliceCollection {
    const { descriptors = [], count = 0 } = dataAccess.getDataAccessPointers().slices ?? {};

    return {
        descriptors,
        count,

        [Symbol.iterator]: (): Iterator<IDataSlice> => {
            return dataAccess.getDataSlicesIterator();
        },
    };
}

class DataAccessMethods implements IDataAccessMethods {
    private readonly dataAccess: DataAccessImpl;
    private readonly seriesCollection: IDataSeriesCollection;
    private readonly slicesCollection: IDataSliceCollection;

    constructor(dataView: IDataView, config: DataAccessConfig) {
        this.dataAccess = new DataAccessImpl(dataView, config);
        this.seriesCollection = createDataSeriesCollection(this.dataAccess);
        this.slicesCollection = createDataSlicesCollection(this.dataAccess);
    }

    public series(): IDataSeriesCollection {
        return this.seriesCollection;
    }

    public slices(): IDataSliceCollection {
        return this.slicesCollection;
    }

    public seriesById(_id: string): IDataSeries | undefined {
        return undefined;
    }

    public sliceById(_id: string): IDataSlice | undefined {
        return undefined;
    }
}

const DefaultDataAccessConfig: DataAccessConfig = {
    valueFormatter: createNumberJsFormatter(),
};

/**
 * @internal
 */
export function newDataAccessMethods(
    dataView: IDataView,
    config: DataAccessConfig = DefaultDataAccessConfig,
): IDataAccessMethods {
    return new DataAccessMethods(dataView, config);
}
