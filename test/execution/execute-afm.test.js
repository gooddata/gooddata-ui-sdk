// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import fetchMock from '../utils/fetch-mock';
import { createModule as executeAfmFactory, nextPageOffset, mergePageData } from '../../src/execution/execute-afm';
import { createModule as xhrFactory } from '../../src/xhr';
import { createModule as configFactory } from '../../src/config';

const config = configFactory();
const xhr = xhrFactory(config);
const executeAfm = executeAfmFactory(xhr);

describe('nextPageOffset', () => {
    it('should work for 1 dimension', () => {
        expect(nextPageOffset({ offset: [0], total: [501] })).toEqual([500]);
        expect(nextPageOffset({ offset: [500], total: [501] })).toEqual(false);
        expect(nextPageOffset({ offset: [0], total: [1] })).toEqual(false);
    });
    it('should work for 2 dimensions', () => {
        expect(nextPageOffset({ offset: [0, 0], total: [501, 501] })).toEqual([0, 500]);
        expect(nextPageOffset({ offset: [0, 500], total: [501, 501] })).toEqual([500, 0]);
        expect(nextPageOffset({ offset: [500, 0], total: [501, 501] })).toEqual([500, 500]);
        expect(nextPageOffset({ offset: [500, 500], total: [501, 501] })).toEqual(false);
    });
    it('should work for 3 dimensions', () => {
        expect(nextPageOffset({ offset: [0, 0, 0], total: [501, 501, 501] })).toEqual([0, 0, 500]);
        expect(nextPageOffset({ offset: [500, 0, 0], total: [501, 501, 501] })).toEqual([500, 0, 500]);
        expect(nextPageOffset({ offset: [500, 500, 500], total: [501, 501, 501] })).toEqual(false);
    });
});

describe('mergePageData', () => {
    it('should work for 1 dimension', () => {
        let result = { executionResult: { data: [1], headerItems: [[['A1']]] } };

        result = mergePageData(result, {
            executionResult: {
                paging: { offset: [1] },
                data: [2],
                headerItems: [[['A1']]]
            }
        });
        expect(result).toEqual({ executionResult: { data: [1, 2], headerItems: [[['A1']]] } });

        result = mergePageData(result, {
            executionResult: {
                paging: { offset: [2] },
                data: [3],
                headerItems: [[['A1']]]
            }
        });
        expect(result).toEqual({ executionResult: { data: [1, 2, 3], headerItems: [[['A1']]] } });
    });

    it('should work for 2 dimensions', () => {
        // page [0,0]
        let result = {
            executionResult: {
                data: [[11, 12], [21, 22]],
                headerItems: [[['M1', 'M2']], [['A1', 'A2']]]
            }
        };

        // merge page [0,1]
        result = mergePageData(result, {
            executionResult: {
                paging: { offset: [0, 2] },
                data: [[13], [23]],
                headerItems: [[['M1', 'M2']], [['A3']]]
            }
        });
        expect(result).toEqual({
            executionResult: {
                data: [[11, 12, 13], [21, 22, 23]],
                headerItems: [[['M1', 'M2']], [['A1', 'A2', 'A3']]]
            }
        });

        // merge page [1,0]
        result = mergePageData(result, {
            executionResult: {
                paging: { offset: [2, 0] },
                data: [[51, 52]],
                headerItems: [[['M5']], [['A1', 'A2']]]
            }
        });
        // merge page [1,1]
        result = mergePageData(result, {
            executionResult: {
                paging: { offset: [2, 2] },
                data: [[53]],
                headerItems: [[['M5']], [['A3']]]
            }
        });
        expect(result).toEqual({
            executionResult: {
                data: [[11, 12, 13], [21, 22, 23], [51, 52, 53]],
                headerItems: [[['M1', 'M2', 'M5']], [['A1', 'A2', 'A3']]]

            }
        });
    });
});

describe('executeAfm', () => {
    beforeEach(() => {
        expect.hasAssertions();
        fetchMock.restore();
    });

    function pollingResponseBody() {
        return {
            executionResponse: {
                dimensions: [],
                links: {
                    executionResult: '/gdc/app/projects/myFakeProjectId/executionResults/123?limit=overriden'
                }
            }
        };
    }

    function executionResultResponseBody() {
        return {
            executionResult: {
                data: [[11, 12], [51, 52]],
                paging: { total: [2, 2], offset: [0, 0] },
                headerItems: [[['M1', 'M2']], [['A1', 'A2']]]
            }
        };
    }

    it('should reject when /executeAfm fails', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            400
        );
        return executeAfm('myFakeProjectId', {}).catch((err) => {
            expect(err).toBeInstanceOf(Error);
            expect(err.response.status).toBe(400);
        });
    });

    it('should reject when first polling fails', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            { status: 200, body: JSON.stringify(pollingResponseBody()) }
        );
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500%2C500&offset=0%2C0',
            400
        );
        return executeAfm('myFakeProjectId', {}).catch((err) => {
            expect(err).toBeInstanceOf(Error);
            expect(err.response.status).toBe(400);
        });
    });

    it('should resolve when first polling returns 204', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            { status: 200, body: JSON.stringify(pollingResponseBody()) }
        );
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500%2C500&offset=0%2C0',
            204
        );
        return executeAfm('myFakeProjectId', {}).then((response) => {
            expect(response).toEqual({
                executionResponse: pollingResponseBody(),
                executionResult: null
            });
        });
    });

    it('should reject when first polling returns 413', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            { status: 200, body: JSON.stringify(pollingResponseBody()) }
        );
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500%2C500&offset=0%2C0',
            413
        );
        return executeAfm('myFakeProjectId', {}).catch((err) => {
            expect(err).toBeInstanceOf(Error);
            expect(err.response.status).toBe(413);
        });
    });

    it('should resolve on first polling', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            { status: 200, body: JSON.stringify(pollingResponseBody()) }
        );
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500%2C500&offset=0%2C0',
            { status: 200, body: JSON.stringify(executionResultResponseBody()) }
        );
        return executeAfm('myFakeProjectId', {}).then((response) => {
            expect(response).toEqual({
                executionResponse: pollingResponseBody(),
                executionResult: executionResultResponseBody()
            });
        });
    });

    it('should resolve on second polling', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            { status: 200, body: JSON.stringify(pollingResponseBody()) }
        );
        let pollingCounter = 0;
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500%2C500&offset=0%2C0',
            () => {
                pollingCounter += 1;
                return pollingCounter === 1
                    ? {
                        status: 202,
                        headers: { Location: '/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500%2C500&offset=0%2C0' }
                    }
                    : {
                        status: 200,
                        body: JSON.stringify(executionResultResponseBody())
                    };
            }
        );
        return executeAfm('myFakeProjectId', {}).then((response) => {
            expect(response).toEqual({
                executionResponse: pollingResponseBody(),
                executionResult: executionResultResponseBody()
            });
        });
    });

    it('should resolve with 2x2 pages', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            { status: 200, body: JSON.stringify(pollingResponseBody()) }
        );

        const pagesByOffset = {
            '0,0': {
                executionResult: {
                    data: Array(500).fill([1, 2]),
                    paging: { total: [501, 501], offset: [0, 0] },
                    headerItems: [[Array(500).fill('M')], [['A1', 'A2']]]
                }
            },
            '0,500': {
                executionResult: {
                    data: Array(500).fill([3]),
                    paging: { total: [501, 501], offset: [0, 500] },
                    headerItems: [[Array(500).fill('M')], [['A3']]]
                }
            },
            '500,0': {
                executionResult: {
                    data: [[91, 92]],
                    paging: { total: [501, 501], offset: [500, 0] },
                    headerItems: [[['M501']], [['A1', 'A2']]]
                }
            },
            '500,500': {
                executionResult: {
                    data: [[93]],
                    paging: { total: [501, 501], offset: [500, 500] },
                    headerItems: [[['M501']], [['A3']]]
                }
            }
        };

        fetchMock.mock(
            'begin:/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500%2C500&offset=',
            (url) => {
                const offset = url.replace(/.*offset=/, '').replace('%2C', ',');
                return { status: 200, body: JSON.stringify(pagesByOffset[offset]) };
            }
        );
        return executeAfm('myFakeProjectId', {}).then((response) => {
            expect(response).toEqual({
                executionResponse: pollingResponseBody(),
                executionResult: {
                    executionResult: {
                        data: [...Array(500).fill([1, 2, 3]), [91, 92, 93]],
                        paging: {
                            total: [501, 501],
                            offset: [0, 0]
                        },
                        headerItems: [[[...Array(500).fill('M'), 'M501']], [['A1', 'A2', 'A3']]]
                    }
                }
            });
        });
    });

    it('should resolve for 1 dimension x 2 pages', () => {
        fetchMock.mock(
            '/gdc/app/projects/myFakeProjectId/executeAfm',
            { status: 200, body: JSON.stringify(pollingResponseBody()) }
        );

        const pagesByOffset = {
            0: { executionResult: { data: [1], paging: { total: [501], offset: [0] }, headerItems: [[['A']]] } },
            500: { executionResult: { data: [2], paging: { total: [501], offset: [500] }, headerItems: [[['A']]] } }
        };

        fetchMock.mock(
            'begin:/gdc/app/projects/myFakeProjectId/executionResults/123?limit=500&offset=',
            (url) => {
                const offset = url.replace(/.*offset=/, '');
                return { status: 200, body: JSON.stringify(pagesByOffset[offset]) };
            }
        );
        return executeAfm('myFakeProjectId', { execution: { resultSpec: { dimensions: [1] } } }).then((response) => {
            expect(response).toEqual({
                executionResponse: pollingResponseBody(),
                executionResult: {
                    executionResult: {
                        data: [1, 2],
                        paging: {
                            total: [501],
                            offset: [0]
                        },
                        headerItems: [[['A']]]
                    }
                }
            });
        });
    });
});
