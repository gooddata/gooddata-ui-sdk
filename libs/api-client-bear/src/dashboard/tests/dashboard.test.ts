// (C) 2019-2022 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import { GdcFilterContext, GdcExport } from "@gooddata/api-model-bear";
import { DashboardModule } from "../dashboard";
import { XhrModule } from "../../xhr";
import { ACCEPTED_REQUEST_STATUS, BAD_REQUEST_STATUS, SUCCESS_REQUEST_STATUS } from "../../constants/errors";
import { mockPollingRequest, mockPollingRequestWithStatus } from "../../tests/utils/polling";
import { mockLocalStorageModule } from "../../tests/mockLocalStorageModule";

const dashboardExportModuleMock = () => new DashboardModule(new XhrModule(fetch, {}, mockLocalStorageModule));

describe("exportDashboard", () => {
    const projectId = "testProjectId";
    const dashboardUri = `/gdc/md/${projectId}/obj/dashboard123`;
    const endpoint = `/gdc/internal/projects/${projectId}/exportDashboard`;
    const createdPdf = `/gdc/exporter/result/${projectId}/pdfFileUri`;

    const relativeDateFilter: GdcFilterContext.FilterContextItem = {
        dateFilter: {
            type: "relative",
            from: "-11",
            to: "11",
            granularity: "GDC.time.month",
        },
    };

    const absoluteDateFilter: GdcFilterContext.FilterContextItem = {
        dateFilter: {
            type: "absolute",
            from: "2019-08-06",
            to: "2019-08-08",
            granularity: "GDC.time.date",
        },
    };

    const attributeFilter: GdcFilterContext.FilterContextItem = {
        attributeFilter: {
            displayForm: "/gdc/md/testProjectId/obj/700",
            negativeSelection: false,
            attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
        },
    };

    describe("successful pdf export", () => {
        beforeEach(() => {
            const mockTask = (status: number) => ({ status, uri: createdPdf });
            const finishedTask = mockTask(SUCCESS_REQUEST_STATUS);
            const runningTask = mockTask(ACCEPTED_REQUEST_STATUS);
            mockPollingRequest(createdPdf, runningTask, finishedTask);

            fetchMock.post(endpoint, {
                uri: createdPdf,
            });
        });

        afterEach(() => {
            fetchMock.restore();
        });

        it("should send POST request with payload", async () => {
            await dashboardExportModuleMock().exportToPdf(
                projectId,
                dashboardUri,
                [absoluteDateFilter, relativeDateFilter, attributeFilter],
                { pollStep: 1 },
            );

            const [, options] = fetchMock.lastCall(endpoint)!;
            expect(options!.method).toBe("POST");
            expect(JSON.parse(options!.body as string)).toEqual({
                dashboardExport: {
                    dashboardUri: "/gdc/md/testProjectId/obj/dashboard123",
                    filters: [
                        {
                            dateFilter: {
                                type: "absolute",
                                from: "2019-08-06",
                                to: "2019-08-08",
                                granularity: "GDC.time.date",
                            },
                        },
                        {
                            dateFilter: {
                                type: "relative",
                                from: "-11",
                                to: "11",
                                granularity: "GDC.time.month",
                            },
                        },
                        {
                            attributeFilter: {
                                displayForm: "/gdc/md/testProjectId/obj/700",
                                negativeSelection: false,
                                attributeElements: [
                                    "/gdc/md/testProjectId/obj/750",
                                    "/gdc/md/testProjectId/obj/751",
                                ],
                            },
                        },
                    ],
                },
            });
        });

        it("should return pdf uri", async () => {
            const response: GdcExport.IExportResponse = await dashboardExportModuleMock().exportToPdf(
                projectId,
                dashboardUri,
                [],
                {
                    pollStep: 1,
                },
            );
            expect(response).toEqual({
                uri: "/gdc/exporter/result/testProjectId/pdfFileUri",
            });
        });
    });

    describe("failed pdf export", () => {
        afterEach(() => {
            fetchMock.restore();
        });

        it("should return error when send export request fail", async () => {
            fetchMock.post(endpoint, {
                status: BAD_REQUEST_STATUS,
            });

            try {
                await dashboardExportModuleMock().exportToPdf(projectId, dashboardUri, []);
            } catch (error: any) {
                expect(error.response.status).toEqual(400);
                expect(error.message).toEqual("Bad Request");
            }
        });

        it("should return error when polling fail", async () => {
            const finishedTask = { status: BAD_REQUEST_STATUS };
            const runningTask = { status: ACCEPTED_REQUEST_STATUS, uri: createdPdf };

            fetchMock.post(endpoint, {
                uri: createdPdf,
            });

            mockPollingRequestWithStatus(createdPdf, runningTask, finishedTask);

            try {
                await dashboardExportModuleMock().exportToPdf(projectId, dashboardUri);
            } catch (error: any) {
                expect(error.response.status).toEqual(400);
                expect(error.message).toEqual("Bad Request");
            }
        });
    });
});
