// (C) 2007-2019 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { ExecuteAFM } from "@gooddata/gd-bear-model";
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
            // TODO: fixme
            it("should sanitized showFilters config", () => {
                fetchMock.mock(projectUri, {
                    status: SUCCESS_REQUEST_STATUS,
                    body: { uri: createdReport },
                });

                const mockTask = (status: number) => ({ status, uri: createdReport });
                const finishedTask = mockTask(SUCCESS_REQUEST_STATUS);
                const runningTask = mockTask(ACCEPTED_REQUEST_STATUS);
                mockPollingRequest(createdReport, runningTask, finishedTask);

                const showFilters: ExecuteAFM.CompatibilityFilter[] = [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                uri: "bar",
                            },
                            in: ["/gdc/md/bar1", "/gdc/md/bar2"],
                        },
                    },
                    {
                        negativeAttributeFilter: {
                            displayForm: {
                                identifier: "foo",
                            },
                            notIn: ["foo1", "foo2"],
                        },
                    },
                    {
                        absoluteDateFilter: {
                            dataSet: {
                                uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/330",
                            },
                            from: "2011-01-01",
                            to: "2011-12-31",
                        },
                    },
                    {
                        relativeDateFilter: {
                            to: 0,
                            from: -3,
                            granularity: "GDC.time.quarter",
                            dataSet: {
                                uri: "/gdc/md/myproject/obj/921",
                            },
                        },
                    },
                ];

                const expectedShowFilters: ExecuteAFM.CompatibilityFilter[] = [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                uri: "bar",
                            },
                            in: ["/gdc/md/bar1", "/gdc/md/bar2"],
                        },
                    },
                    {
                        negativeAttributeFilter: {
                            displayForm: {
                                identifier: "foo",
                            },
                            notIn: ["foo1", "foo2"],
                        },
                    },
                    {
                        absoluteDateFilter: {
                            dataSet: {
                                uri: "/gdc/md/i6k6sk4sznefv1kf0f2ls7jf8tm5ida6/obj/330",
                            },
                            from: "2011-01-01",
                            to: "2011-12-31",
                        },
                    },
                    {
                        relativeDateFilter: {
                            dataSet: {
                                uri: "/gdc/md/myproject/obj/921",
                            },
                            from: -3,
                            granularity: "GDC.time.quarter",
                            to: 0,
                        },
                    },
                ];

                const exportConfig: IExportConfig = {
                    title: "title",
                    format: "xlsx",
                    mergeHeaders: false,
                    showFilters,
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
                                    showFilters: expectedShowFilters,
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
