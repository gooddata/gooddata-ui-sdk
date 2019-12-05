// (C) 2007-2019 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { AFM, ExecuteAFM } from "@gooddata/typings";
import { ReportModule } from "../../src/report/report";
import { XhrModule, ApiResponseError } from "../../src/xhr";
import { IExportConfig, IExportResponse } from "../../src/interfaces";
import { mockPollingRequest, mockPollingRequestWithStatus } from "../helpers/polling";
import {
    SUCCESS_REQUEST_STATUS,
    ACCEPTED_REQUEST_STATUS,
    BAD_REQUEST_STATUS,
    BAD_REQUEST_MESSAGE,
    ERROR_RESTRICTED_MESSAGE,
} from "../../src/constants/errors";

const mockedReportModule = () => new ReportModule(new XhrModule(fetch, {}));

describe("report", () => {
    const createdReport = "/gdc/exporter/result/12345";
    const executionResult = "/executionResult/1234";
    const projectId = "1";
    const projectUri = `/gdc/internal/projects/${projectId}/exportResult`;

    describe("export", () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe("exportResult", () => {
            it("should sanitized showFilters config", () => {
                fetchMock.mock(projectUri, {
                    status: SUCCESS_REQUEST_STATUS,
                    body: { uri: createdReport },
                });

                const mockTask = (status: number) => ({ status, uri: createdReport });
                const finishedTask = mockTask(SUCCESS_REQUEST_STATUS);
                const runningTask = mockTask(ACCEPTED_REQUEST_STATUS);
                mockPollingRequest(createdReport, runningTask, finishedTask);

                const afm: AFM.IAfm = {
                    measures: [
                        {
                            localIdentifier: "a14fb77382304ab4925f05d2d64f7aed",
                            definition: {
                                measure: {
                                    item: {
                                        uri: "/gdc/md/projectId/obj/16203",
                                    },
                                },
                            },
                            alias: "Conversion",
                        },
                    ],
                    attributes: [
                        {
                            displayForm: {
                                uri: "/gdc/md/projectId/obj/15358",
                            },
                            localIdentifier: "645bf676a4854a32b694390bba9bd63c",
                        },
                    ],
                    filters: [
                        {
                            measureValueFilter: {
                                measure: {
                                    localIdentifier: "a14fb77382304ab4925f05d2d64f7aed",
                                },
                                condition: {
                                    comparison: {
                                        operator: "GREATER_THAN",
                                        value: 350000,
                                    },
                                },
                            },
                        },
                    ],
                };

                const expectedAfm: ExecuteAFM.IAfm = {
                    measures: [
                        {
                            localIdentifier: "a14fb77382304ab4925f05d2d64f7aed",
                            definition: {
                                measure: {
                                    item: {
                                        uri: "/gdc/md/projectId/obj/16203",
                                    },
                                },
                            },
                            alias: "Conversion",
                        },
                    ],
                    attributes: [
                        {
                            displayForm: {
                                uri: "/gdc/md/projectId/obj/15358",
                            },
                            localIdentifier: "645bf676a4854a32b694390bba9bd63c",
                        },
                    ],
                    filters: [
                        {
                            measureValueFilter: {
                                measure: {
                                    localIdentifier: "a14fb77382304ab4925f05d2d64f7aed",
                                },
                                condition: {
                                    comparison: {
                                        operator: "GREATER_THAN",
                                        value: 350000,
                                    },
                                },
                            },
                        },
                    ],
                };

                const exportConfig: IExportConfig = {
                    title: "title",
                    format: "xlsx",
                    mergeHeaders: false,
                    showFilters: true,
                    afm,
                };

                return mockedReportModule()
                    .exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then(() => {
                        const [, settings] = fetchMock.lastCall(
                            `/gdc/internal/projects/${projectId}/exportResult`,
                        );
                        expect(JSON.parse(settings.body as string)).toEqual({
                            resultExport: {
                                executionResult: "/executionResult/1234",
                                exportConfig: {
                                    title: "title",
                                    format: "xlsx",
                                    mergeHeaders: false,
                                    showFilters: true,
                                    afm: expectedAfm,
                                },
                            },
                        });
                    });
            });

            it("should return created file", () => {
                fetchMock.mock(projectUri, {
                    status: SUCCESS_REQUEST_STATUS,
                    body: { uri: createdReport },
                });

                const mockTask = (status: number) => ({ status, uri: createdReport });
                const finishedTask = mockTask(SUCCESS_REQUEST_STATUS);
                const runningTask = mockTask(ACCEPTED_REQUEST_STATUS);
                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: IExportConfig = {
                    title: "title",
                    format: "xlsx",
                    mergeHeaders: false,
                };

                return mockedReportModule()
                    .exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then((result: IExportResponse) => expect(result.uri).toEqual(createdReport));
            });

            it("should return error when polling fail", () => {
                const finishedTask = { status: BAD_REQUEST_STATUS };
                const runningTask = { status: ACCEPTED_REQUEST_STATUS, uri: createdReport };

                fetchMock.mock(projectUri, { uri: createdReport });

                mockPollingRequestWithStatus(createdReport, runningTask, finishedTask);

                const exportConfig: IExportConfig = {
                    title: "title",
                    format: "xlsx",
                    mergeHeaders: false,
                };

                return mockedReportModule()
                    .exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then(null, (error: ApiResponseError) => expect(error.message).toEqual("Bad Request"));
            });

            it("should return restricted error", () => {
                const finishedTask = {
                    status: BAD_REQUEST_STATUS,
                    // tslint:disable-next-line:max-line-length
                    body:
                        '{"error":{"message":"During export we\'ve detected user error: Export to required format is not allowed for data flagged as restricted."}}',
                };
                const runningTask = { status: ACCEPTED_REQUEST_STATUS, uri: createdReport };

                fetchMock.mock(projectUri, finishedTask);

                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: IExportConfig = {
                    title: "title",
                    format: "xlsx",
                    mergeHeaders: false,
                };

                return mockedReportModule()
                    .exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then(null, (error: ApiResponseError) => {
                        expect(error.response.status).toBe(BAD_REQUEST_STATUS);
                        expect(error.response.statusText).toBe(BAD_REQUEST_MESSAGE);
                        expect(error.message).toBe(ERROR_RESTRICTED_MESSAGE);
                    });
            });

            it("should reject with 400 when resource fails", () => {
                fetchMock.mock(projectUri, { status: BAD_REQUEST_STATUS });

                return mockedReportModule()
                    .exportResult(projectId, executionResult)
                    .then(null, (error: ApiResponseError) => {
                        // error thrown in xhr.ts
                        expect(error.response.status).toEqual(400);
                        expect(error.message).toEqual("Bad Request");
                    });
            });
        });
    });
});
