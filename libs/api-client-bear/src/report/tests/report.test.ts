// (C) 2007-2022 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { ReportModule } from "../report";
import { XhrModule, ApiResponseError } from "../../xhr";
import { mockPollingRequest, mockPollingRequestWithStatus } from "../../tests/utils/polling";
import {
    SUCCESS_REQUEST_STATUS,
    ACCEPTED_REQUEST_STATUS,
    BAD_REQUEST_STATUS,
    BAD_REQUEST_MESSAGE,
    ERROR_RESTRICTED_MESSAGE,
} from "../../constants/errors";
import { GdcExport } from "@gooddata/api-model-bear";
import { LocalStorageModule } from "../../localStorage";

const mockedReportModule = () => new ReportModule(new XhrModule(fetch, {}, new LocalStorageModule()));

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
            it("should return created file", () => {
                fetchMock.mock(projectUri, {
                    status: SUCCESS_REQUEST_STATUS,
                    body: { uri: createdReport },
                });

                const mockTask = (status: number) => ({ status, uri: createdReport });
                const finishedTask = mockTask(SUCCESS_REQUEST_STATUS);
                const runningTask = mockTask(ACCEPTED_REQUEST_STATUS);
                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: GdcExport.IExportConfig = {
                    title: "title",
                    format: "xlsx",
                    mergeHeaders: false,
                };

                return mockedReportModule()
                    .exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then((result: GdcExport.IExportResponse) => {
                        expect(result.uri).toEqual(createdReport);

                        const [, settings] = fetchMock.lastCall(
                            `/gdc/internal/projects/${projectId}/exportResult`,
                        )!;
                        expect(JSON.parse(settings!.body as string)).toEqual({
                            resultExport: {
                                executionResult: "/executionResult/1234",
                                exportConfig: {
                                    title: "title",
                                    format: "xlsx",
                                    mergeHeaders: false,
                                },
                            },
                        });
                    });
            });

            it("should return error when polling fail", () => {
                const finishedTask = { status: BAD_REQUEST_STATUS };
                const runningTask = { status: ACCEPTED_REQUEST_STATUS, uri: createdReport };

                fetchMock.mock(projectUri, { uri: createdReport });

                mockPollingRequestWithStatus(createdReport, runningTask, finishedTask);

                const exportConfig: GdcExport.IExportConfig = {
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
                    body: '{"error":{"message":"During export we\'ve detected user error: Export to required format is not allowed for data flagged as restricted."}}',
                };
                const runningTask = { status: ACCEPTED_REQUEST_STATUS, uri: createdReport };

                fetchMock.mock(projectUri, finishedTask);

                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: GdcExport.IExportConfig = {
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
