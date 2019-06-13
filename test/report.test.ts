// (C) 2007-2019 GoodData Corporation
import "isomorphic-fetch";
import * as fetchMock from "fetch-mock";
import { ReportModule } from "../src/report";
import { XhrModule, ApiResponseError } from "../src/xhr";
import { IExportConfig, IExportResponse } from "../src/interfaces";
import { mockPollingRequest } from "./helpers/polling";
import {
    SUCCESS_REQUEST_STATUS,
    ACCEPTED_REQUEST_STATUS,
    BAD_REQUEST_STATUS,
    BAD_REQUEST_MESSAGE,
    ERROR_RESTRICTED_MESSAGE,
} from "../src/constants/errors";

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

                fetchMock.mock(projectUri, finishedTask);

                mockPollingRequest(createdReport, runningTask, finishedTask);

                const exportConfig: IExportConfig = {
                    title: "title",
                    format: "xlsx",
                    mergeHeaders: false,
                };

                return mockedReportModule()
                    .exportResult(projectId, executionResult, exportConfig, { pollStep: 1 })
                    .then(null, (error: Error) => expect(error.message).toEqual("Bad Request"));
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
                fetchMock.mock(projectUri, BAD_REQUEST_STATUS);

                return mockedReportModule()
                    .exportResult(projectId, executionResult)
                    .then(null, (error: Error) => expect(error).toBeInstanceOf(Error));
            });
        });
    });
});
