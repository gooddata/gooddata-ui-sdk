import {
    Afm,
    Converters,
    DataSource,
    SimpleMetadataSource,
    VisualizationObject
} from '@gooddata/data-layer';

import {
    initChartDataLoading,
    initTableDataLoading,
    ITableResult
} from '../load';

import { ErrorStates, ErrorCodes } from '../../constants/errorStates';

export class MockedDataSource implements DataSource.IDataSource {
    private data;
    private resolve;

    constructor(data, resolve = true) {
        this.data = data;
        this.resolve = resolve;
    }

    public getData(): Promise<any> {
        if (this.resolve) {
            return Promise.resolve(this.data);
        }

        return Promise.reject(this.data);
    }

    public getAfm(): Afm.IAfm {
        return {};
    }

    public getFingerprint(): string {
        return '{}';
    }
}

class InvalidMetadataSource {
    getVisualizationMetadata() {
        return Promise.reject('error');
    }
}

const mockedToAfm = (): Converters.IConvertedAFM => {
    return {
        afm: {},
        transformation: {},
        type: 'line'
    };
};

export function getMdObject(customConfig = {}):VisualizationObject.IVisualizationObject {
    return {
        type: 'line',
        buckets: {
            filters: [],
            measures: [{
                measure: {
                    type: 'metric',
                    objectUri: 'someuri',
                    showInPercent: false,
                    showPoP: false,
                    title: 'title',
                    measureFilters: []
                }
            }],
            categories: [{
                category: {
                    type: 'attribute',
                    collection: 'stack',
                    displayForm: 'df'
                }
            }]
        },
        ...customConfig
    };
}

const measuresMap = {};

describe('initTableDataLoading', () => {
    it('should fail with unknown reason -- getVisualizationMetadata rejects', () => {
        expect.assertions(1);
        const invalidMDS = new InvalidMetadataSource();
        const mockedDS = new MockedDataSource({});

        return initTableDataLoading(invalidMDS, mockedDS, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should fail with unknown reason -- getVisualizationMetadata rejects', () => {
        expect.assertions(1);
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({}, false);

        return initTableDataLoading(mds, ds, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should throw is empty error', () => {
        const executionResult = { isEmpty: true };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionResult);

        return initTableDataLoading(mds, ds, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.NO_DATA));
    });

    it('should throw data too large error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_TOO_LARGE } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initTableDataLoading(mds, ds, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
    });

    it('should throw bad request error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_BAD_REQUEST } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initTableDataLoading(mds, ds, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.BAD_REQUEST));
    });

    it('should return metadata and sorting from metadata source', async () => {
        expect.assertions(1);
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({});

        const result = await initTableDataLoading(mds, ds, null) as ITableResult;
        expect(result.metadata.content.type === 'line' && !result.sorting).toBeTruthy();
    });

    it('should return metadata and sorting from provided config', async () => {
        expect.assertions(1);
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({});
        const currentMdObject = getMdObject({ type: 'bar' });
        const currentSorting = { column: 'abc', direction: 'asc' };
        const currentConfig = {
            metadata: { content: currentMdObject },
            sorting: currentSorting
        };

        const result = await initTableDataLoading(mds, ds, currentConfig) as ITableResult;
        expect(result.metadata.content.type === 'bar' && result.sorting.column === 'abc').toBeTruthy();
    });
});

describe('initChartDataLoading', () => {
    it('should fail with unknown reason -- getMetadata rejects', () => {
        expect.assertions(1);
        const invalidMDS = new InvalidMetadataSource();
        const mockedDS = new MockedDataSource({});

        return initChartDataLoading(invalidMDS, mockedDS)
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should fail with unknown reason -- getData rejects', () => {
        expect.assertions(1);
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({}, false);

        return initChartDataLoading(mds, ds)
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should throw is empty error', () => {
        const executionResult = { isEmpty: true };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionResult);

        return initChartDataLoading(mds, ds)
            .catch(reason => expect(reason).toEqual(ErrorStates.NO_DATA));
    });

    it('should throw data too large error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_TOO_LARGE } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initChartDataLoading(mds, ds)
            .catch(reason => expect(reason).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
    });

    it('should throw bad request error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_BAD_REQUEST } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initChartDataLoading(mds, ds)
            .catch(reason => expect(reason).toEqual(ErrorStates.BAD_REQUEST));
    });

    it('should return object with execution result and md object', async () => {
        const executionResult = {
            headers: [{
                id: 'id1', type: 'metric', title: 'title'
            }],
            rawData: [[1777]],
            isEmpty: false,
            isLoaded: true
        };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionResult);
        const expectedResult = {
            result: executionResult,
            metadata: { content: mdObject, meta: {} }
        };
        const result = await initChartDataLoading(mds, ds, { toAFM: mockedToAfm });

        expect(result).toEqual(expectedResult);
    });
});
