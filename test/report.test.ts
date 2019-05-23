// (C) 2007-2019 GoodData Corporation
import 'isomorphic-fetch';
import * as fetchMock from 'fetch-mock';
import { ReportModule } from '../src/report';
import { XhrModule } from '../src/xhr';
import { IExportConfig, IExportResponse } from '../src/interfaces';
import { mockPollingRequest } from './helpers/polling';

const mockedReportModule = () => new ReportModule(new XhrModule(fetch, {}));

describe('report', () => {
    const createdReport = '/gdc/exporter/result/12345';
    const executionResult = '/executionResult/1234';
    const projectId = '1';
    const projectUri = `/gdc/internal/projects/${projectId}/exportResult`;

    describe('export', () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe('exportResult', () => {
            it('should return created file', () => {
                fetchMock.mock(
                    projectUri,
                    {
                        status: 200,
                        body: { uri: createdReport }
                    }
                );

                const mockTask = (status: number) => ({ status, uri: createdReport });
                const finishedTask = mockTask(200);
                const runningTask = mockTask(202);
                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: IExportConfig = {
                    title: 'title',
                    format: 'xlsx',
                    mergeHeaders: false
                };

                return mockedReportModule().exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then((result: IExportResponse) => expect(result.uri).toEqual(createdReport));
            });

            it('should return error when polling fail', () => {
                const finishedTask = { status: 400 };
                const runningTask = { status: 202, uri: createdReport };

                fetchMock.mock(
                    projectUri,
                    finishedTask
                );

                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: IExportConfig = {
                    title: 'title',
                    format: 'xlsx',
                    mergeHeaders: false
                };

                return mockedReportModule().exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then(null, (error: Error) => expect(error.message).toEqual('Bad Request'));
            });

            it('should return restricted error', () => {
                const finishedTask = {
                    status: 400,
                    // tslint:disable-next-line:max-line-length
                    body: '{"error":{"message":"During export we\'ve detected user error: Export to required format is not allowed for data flagged as restricted."}}'
                };
                const runningTask = { status: 202, uri: createdReport };

                fetchMock.mock(
                    projectUri,
                    finishedTask
                );

                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: IExportConfig = {
                    title: 'title',
                    format: 'xlsx',
                    mergeHeaders: false
                };

                return mockedReportModule()
                    .exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then(null, (error: Error) => expect(error.message).toBe(
                        'You cannot export this insight because it contains restricted data.'
                    ));
            });

            it('should reject with 400 when resource fails', () => {
                fetchMock.mock(
                    projectUri,
                    400
                );

                return mockedReportModule().exportResult(projectId, executionResult)
                    .then(null, (error: Error) => expect(error).toBeInstanceOf(Error));
            });
        });
    });
});
