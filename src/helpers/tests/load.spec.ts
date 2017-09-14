import { ISimpleExecutorResult } from 'gooddata';
import {
    Afm,
    DataSource,
    Header,
    SimpleMetadataSource,
    Transformation,
    VisualizationObject,
    ErrorCodes
} from '@gooddata/data-layer';
import cloneDeep = require('lodash/cloneDeep');

import {
    initChartDataLoading,
    initTableDataLoading,
    ITableResult
} from '../load';

import { ISorting } from '../metadata';

import { ErrorStates, ErrorCodes as ComponentsErrorCodes } from '../../constants/errorStates';
import { VisualizationTypes } from '../../constants/visualizationTypes';

export class MockedDataSource implements DataSource.IDataSource<ISimpleExecutorResult> {
    private data: any;
    private resolve: boolean;

    constructor(data: any, resolve = true) {
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
    public getFingerprint: () => '{}';
    public getVisualizationMetadata() {
        return Promise.reject('error');
    }
}

export function getMdObject(customConfig = {}): VisualizationObject.IVisualizationObjectContent {
    return {
        type: VisualizationTypes.LINE,
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
    const emptyExecutionResult = { isEmpty: true };
    const executionResult: ISimpleExecutorResult = {
        headers: [{
            id: 'id1', type: Header.HeaderType.Metric, title: 'title'
        }],
        rawData: [['1777']],
        isEmpty: false,
        isLoaded: true
    };

    it('should fail with unknown reason -- getVisualizationMetadata rejects', () => {
        expect.assertions(1);
        const invalidMDS = new InvalidMetadataSource();
        const mockedDS = new MockedDataSource({});

        return initTableDataLoading(mockedDS, invalidMDS, {}, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should fail with unknown reason -- getVisualizationMetadata rejects', () => {
        expect.assertions(1);
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({}, false);

        return initTableDataLoading(ds, mds, {}, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should throw is empty error', () => {
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(emptyExecutionResult);

        return initTableDataLoading(ds, mds, {}, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.NO_DATA));
    });

    it('should throw data too large error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_TOO_LARGE } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initTableDataLoading(ds, mds, {}, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
    });

    it('should throw bad request error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_BAD_REQUEST } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initTableDataLoading(ds, mds, {}, null)
            .catch(reason => expect(reason).toEqual(ErrorStates.BAD_REQUEST));
    });

    it('should return metadata and sorting from metadata source', async () => {
        expect.assertions(2);
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({});

        const result = await initTableDataLoading(ds, mds, {}, null) as ITableResult;
        expect(result.metadata.content.type).toBe(VisualizationTypes.LINE);
        expect(result.sorting).toEqual({
            sorting: undefined,
            change: null
        });
    });

    it('should return metadata and sorting from provided config', async () => {
        expect.assertions(2);
        const mdObject = getMdObject({ type: VisualizationTypes.BAR });
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({});
        const currentSorting = { column: 'm1', direction: 'asc' };
        const currentConfig = {
            sorting: currentSorting,
            change: {
                id: 'm1',
                title: 'xxx',
                type: 'metric',
                uri: '/uri/'
            }

        };

        const result = await initTableDataLoading(ds, mds, {}, currentConfig) as ITableResult;
        expect(result.metadata.content.type).toBe(VisualizationTypes.BAR);
        expect(result.sorting.sorting.column).toBe('m1');
    });

    it('should use provided transformation when called without MDS', async () => {
        expect.assertions(1);
        const transformation: Transformation.ITransformation = {
            sorting: [{
                column: 'id1',
                direction: 'asc'
            }],
            measures: [{
                id: 'id1',
                title: 'My measure one',
                format: '#,##0.0'
            }]
        };
        const ds = {
            getData: jest.fn().mockReturnValue(Promise.resolve(executionResult)),
            getAfm: jest.fn().mockReturnValue(''),
            getFingerprint: jest.fn().mockReturnValue('')
        };

        await initTableDataLoading(ds, null, transformation);

        expect(ds.getData).toHaveBeenCalledWith(transformation);
    });

    it('should merge provided transformation and sorting when called without MDS', async () => {
        expect.assertions(1);
        const transformation: Transformation.ITransformation = {
            sorting: [{
                column: 'm1',
                direction: 'asc'
            }],
            measures: [{
                id: 'm1',
                title: 'My measure one',
                format: '#,##0.0'
            }]
        };
        const sortingInfo: ISorting = {
            sorting: {
                column: 'm1',
                direction: 'desc'
            },
            change: {
                id: 'm1',
                title: 'title',
                type: 'metric',
                uri: 'URI'
            }
        };

        const expectedTransformation = {
            sorting: [{
                column: 'm1',
                direction: 'desc'
            }],
            measures: [{
                format: '#,##0.0',
                id: 'm1',
                title: 'My measure one'
            }]
        };

        const ds = {
            getData: jest.fn().mockReturnValue(Promise.resolve(executionResult)),
            getAfm: jest.fn().mockReturnValue(''),
            getFingerprint: jest.fn().mockReturnValue('')
        };

        await initTableDataLoading(ds, null, transformation, sortingInfo);

        expect(ds.getData).toHaveBeenCalledWith(expectedTransformation);
    });

    it('should use provided transformation if given sorting has no "change"', async () => {
        expect.assertions(1);
        const transformation: Transformation.ITransformation = {
            sorting: [{
                column: 'm1',
                direction: 'asc'
            }],
            measures: [{
                id: 'm1',
                title: 'My measure one',
                format: '#,##0.0'
            }]
        };
        const sortingInfo: ISorting = {
            change: null,
            sorting: {
                column: 'm1',
                direction: 'desc'
            }
        };

        const ds = {
            getData: jest.fn().mockReturnValue(Promise.resolve(executionResult)),
            getAfm: jest.fn().mockReturnValue(''),
            getFingerprint: jest.fn().mockReturnValue('')
        };

        await initTableDataLoading(ds, null, transformation, sortingInfo);

        expect(ds.getData).toHaveBeenCalledWith(transformation);
    });

    it('should merge all inputs (sorting has highest prior.) and update MD object and transformation', async () => {
        expect.assertions(3);
        const transformation: Transformation.ITransformation = {
            measures: [{
                id: 'm1',
                title: 'My measure one',
                format: '#,##0.0'
            }],
            sorting: [{
                column: 'm1',
                direction: 'asc'
            }]
        };
        const md: VisualizationObject.IVisualizationObjectContent = {
            type: VisualizationTypes.TABLE,
            buckets: {
                measures: [
                    {
                        measure: {
                            type: 'metric',
                            objectUri: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/14636',
                            title: '# of Activities',
                            measureFilters: [],
                            showInPercent: false,
                            showPoP: false
                        }
                    }
                ],
                categories: [
                    {
                        category: {
                            type: 'attribute',
                            collection: 'attribute',
                            attribute: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1251',
                            displayForm: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/1252',
                            sort: 'desc'
                        }
                    }
                ],
                filters: []
            }
        };
        const mdObject = getMdObject(md);

        const sorting = {
            sorting: {
                column: 'm1',
                direction: 'desc'
            },
            change: {
                type: 'metric',
                id: 'm1',
                title: '# of Activities',
                format: '#,##0',
                identifier: '',
                uri: '/gdc/md/x3k4294x4k00lrz5degxnc6nykynhh52/obj/14636'
            }
        };

        const expectedTransformation = {
            measures: [{
                format: '#,##0.0',
                id: 'm1',
                title: 'My measure one'
            }],
            sorting: [{
                column: 'm1',
                direction: 'desc'
            }]
        };

        const ds = {
            getData: jest.fn().mockReturnValue(Promise.resolve(executionResult)),
            getAfm: jest.fn().mockReturnValue(''),
            getFingerprint: jest.fn().mockReturnValue('')
        };
        const mds = new SimpleMetadataSource(mdObject, measuresMap);

        const result = await initTableDataLoading(ds, mds, transformation, sorting);

        const expectedMDcontent: VisualizationObject.IVisualizationObjectContent = cloneDeep(md);
        expectedMDcontent.buckets.measures[0].measure.generatedId = 'm1';
        expectedMDcontent.buckets.measures[0].measure.sort = {
            direction: 'desc'
        };
        expectedMDcontent.buckets.categories[0].category.sort = null;
        const expectedMD = {
            content: expectedMDcontent,
            meta: {
                title: 'Test'
            }
        };

        expect(ds.getData).toHaveBeenCalledWith(expectedTransformation);
        expect(result.metadata).toEqual(expectedMD);
        expect(result.sorting).toEqual(sorting);
    });

    it('should discard table sorting when selected column removed and sync sorting with MD', async () => {
        expect.assertions(2);
        const mdObject = getMdObject({
            type: VisualizationTypes.BAR,
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
                        displayForm: 'df',
                        sort: 'desc'
                    }
                }]
            }
        });
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({});
        const currentSorting = { column: 'no_more', direction: 'asc' };
        const currentConfig = {
            sorting: currentSorting,
            change: {
                id: 'no_more',
                title: 'xxx',
                type: 'metric',
                uri: '/uri/'
            }

        };

        const result = await initTableDataLoading(ds, mds, {}, currentConfig) as ITableResult;
        expect(result.sorting.sorting).toEqual({
            column: 'df',
            direction: 'desc'
        });
        expect(result.sorting.change).toBeNull();
    });
});

describe('initChartDataLoading', () => {
    it('should fail with unknown reason -- getMetadata rejects', () => {
        expect.assertions(1);
        const invalidMDS = new InvalidMetadataSource();
        const mockedDS = new MockedDataSource({});

        return initChartDataLoading(mockedDS, invalidMDS, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should fail with unknown reason -- getData rejects', () => {
        expect.assertions(1);
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource({}, false);

        return initChartDataLoading(ds, mds, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.UNKNOWN_ERROR));
    });

    it('should throw is empty error', () => {
        const executionResult: ISimpleExecutorResult = { isEmpty: true };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionResult);

        return initChartDataLoading(ds, mds, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.NO_DATA));
    });

    it('should throw data too large error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_TOO_LARGE } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initChartDataLoading(ds, mds, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE));
    });

    it('should throw bad request error', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_BAD_REQUEST } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initChartDataLoading(ds, mds, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.BAD_REQUEST));
    });

    it('should throw empty AFM error', () => {
        const executionError = { response: { status: ComponentsErrorCodes.EMPTY_AFM } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initChartDataLoading(ds, mds, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.EMPTY_AFM));
    });

    it('should throw Invalid buckets error', () => {
        const executionError = { response: { status: ComponentsErrorCodes.INVALID_BUCKETS } };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionError, false);

        return initChartDataLoading(ds, mds, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.INVALID_BUCKETS));
    });

    it('should handle error even if MDS is undefined', () => {
        const executionError = { response: { status: ErrorCodes.HTTP_BAD_REQUEST } };
        const ds = new MockedDataSource(executionError, false);

        return initChartDataLoading(ds, undefined, {})
            .catch(reason => expect(reason).toEqual(ErrorStates.BAD_REQUEST));
    });

    it('should return object with execution result and md object', async () => {
        const executionResult: ISimpleExecutorResult = {
            headers: [{
                id: 'id1', type: Header.HeaderType.Metric, title: 'title'
            }],
            rawData: [['1777']],
            isEmpty: false,
            isLoaded: true
        };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = new MockedDataSource(executionResult);
        const expectedResult = {
            result: executionResult,
            metadata: {
                content: mdObject,
                meta: {
                    title: 'Test'
                }
            }
        };
        const result = await initChartDataLoading(ds, mds, {});

        expect(result).toEqual(expectedResult);
    });

    it('should use provided transformation when called without MDS', async () => {
        expect.assertions(1);
        const executionResult: ISimpleExecutorResult = {
            headers: [{
                id: 'id1', type: Header.HeaderType.Metric, title: 'title'
            }],
            rawData: [['1777']],
            isEmpty: false,
            isLoaded: true
        };
        const transformation: Transformation.ITransformation = {
            sorting: [{
                column: 'id1',
                direction: 'asc'
            }],
            measures: [{
                id: 'id1',
                title: 'My measure one',
                format: '#,##0.0'
            }]
        };
        const ds = {
            getData: jest.fn().mockReturnValue(Promise.resolve(executionResult)),
            getAfm: jest.fn().mockReturnValue(''),
            getFingerprint: jest.fn().mockReturnValue('')
        };

        await initChartDataLoading(ds, null, transformation);

        expect(ds.getData).toHaveBeenCalledWith(transformation);
    });

    it('should merge provided transformation and MD object', async () => {
        expect.assertions(1);
        const executionResult: ISimpleExecutorResult = {
            headers: [{
                id: 'm1', type: Header.HeaderType.Metric, title: 'title'
            }],
            rawData: [['1777']],
            isEmpty: false,
            isLoaded: true
        };
        const transformation: Transformation.ITransformation = {
            measures: [{
                id: 'm1',
                title: 'My measure one',
                format: '#,##0.0'
            }]
        };
        const expectedTransformation: Transformation.ITransformation = {
            dimensions: [{
                attributes: [{ id: 'df' }],
                name: 'stacks'
            }],
            measures: [{
                format: '#,##0.0',
                id: 'm1',
                title: 'My measure one'
            }]
        };
        const mdObject = getMdObject();
        const mds = new SimpleMetadataSource(mdObject, measuresMap);
        const ds = {
            getData: jest.fn().mockReturnValue(Promise.resolve(executionResult)),
            getAfm: jest.fn().mockReturnValue(''),
            getFingerprint: jest.fn().mockReturnValue('')
        };

        await initChartDataLoading(ds, mds, transformation);

        expect(ds.getData).toHaveBeenCalledWith(expectedTransformation);
    });
});
