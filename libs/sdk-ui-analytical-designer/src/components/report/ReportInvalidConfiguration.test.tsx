// (C) 2023-2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { executionInitialState } from "../../store/execution/execution_state.js";
import { type IWorkspacePermissionsState } from "../../store/permissions/permissions_state.js";
import { type IAppState } from "../../store/types.js";
import { withReport, withRoot } from "../../tests/state_builder.test.helpers.js";
import { type IErrorResponseData } from "../../typings/report.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { ReportInvalidConfiguration } from "./ReportInvalidConfiguration.js";

const ERROR_TRACE_ID_QUERY = /Error trace ID/;
const SHOW_RAW_RESPONSE_QUERY = /See the raw error response for details/;
const DEFAULT_DESCRIPTION_QUERY = /Try applying different filters, or using different metrics or attributes./;
const DESCRIPTION_ERROR_500_QUERY = /An error has occurred. Please try again later./;
const DESCRIPTION_ERROR_400_QUERY = /A calculation error occurred./;

vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../backend", async (importOriginal) => {
    const actualModule = (await importOriginal()) as object;
    return {
        __esModule: true,
        ...actualModule,
    };
});

describe("ReportInvalidConfiguration", () => {
    // the component reads everything from the store, so the tests seed the relevant subtrees
    const renderReportMessage = (errorResponseData: IErrorResponseData, canManageProject: boolean) => {
        const seed = (state: IAppState) =>
            withRoot(
                withReport(state, {
                    execution: {
                        ...executionInitialState,
                        error: { responseData: errorResponseData },
                    },
                }),
                { workspacePermissions: { canManageProject } as unknown as IWorkspacePermissionsState },
            );
        const Wrapped = withRedux(withIntl(ReportInvalidConfiguration), seed);
        return render(<Wrapped />);
    };

    const traceId = "trace_id";

    describe("Tiger backend", () => {
        it("renders TraceIdMessage", () => {
            const errorResponseData: IErrorResponseData = { traceId, httpStatus: 400, rawData: null };
            renderReportMessage(errorResponseData, false);

            expect(screen.queryByText(ERROR_TRACE_ID_QUERY)).toBeInTheDocument();
        });

        it("do not render TraceIdMessage when the trace ID is empty.", () => {
            const errorResponseData: IErrorResponseData = { traceId: null, httpStatus: 400, rawData: null };
            renderReportMessage(errorResponseData, false);
            expect(screen.queryByText(ERROR_TRACE_ID_QUERY)).not.toBeInTheDocument();
        });

        it("renders default description when `canManageProject` is false", () => {
            const errorResponseData: IErrorResponseData = { traceId, httpStatus: 400, rawData: null };
            renderReportMessage(errorResponseData, false);
            expect(screen.queryByText(DEFAULT_DESCRIPTION_QUERY)).toBeInTheDocument();
        });

        it("renders alternative description when `canManageProject` is true and `errorResponseData` has status >= 500", () => {
            const errorResponseData: IErrorResponseData = { traceId, httpStatus: 500, rawData: null };
            renderReportMessage(errorResponseData, true);
            expect(screen.queryByText(DESCRIPTION_ERROR_500_QUERY)).toBeInTheDocument();
        });

        it("renders alternative description when `canManageProject` is true and `errorResponseData` has status < 500", () => {
            const errorResponseData: IErrorResponseData = { traceId, httpStatus: 400, rawData: null };
            renderReportMessage(errorResponseData, true);
            expect(screen.queryByText(DESCRIPTION_ERROR_400_QUERY)).toBeInTheDocument();
        });

        it("renders ErrorRawDataArea when `canManageProject` is true and `errorResponseData` has status < 500", () => {
            const rawData = {
                traceId,
                status: 400,
                message: "error 400",
            };
            const errorResponseData: IErrorResponseData = { traceId, httpStatus: 400, rawData };
            renderReportMessage(errorResponseData, true);

            const showMoreLink = screen.queryByText(SHOW_RAW_RESPONSE_QUERY);
            expect(showMoreLink).toBeInTheDocument();
            fireEvent.click(showMoreLink);
            expect(screen.queryByText(SHOW_RAW_RESPONSE_QUERY)).not.toBeInTheDocument();
        });

        it("do not render ErrorRawDataArea when `canManageProject` is false", () => {
            const rawData = {
                traceId,
                status: 400,
                message: "error 400",
            };
            const errorResponseData: IErrorResponseData = { traceId, httpStatus: 400, rawData };
            renderReportMessage(errorResponseData, false);

            expect(screen.queryByText(SHOW_RAW_RESPONSE_QUERY)).not.toBeInTheDocument();
        });

        it("do not render ErrorRawDataArea when `canManageProject` is true and `errorResponseData` has status >= 500", () => {
            const rawData = {
                traceId,
                status: 500,
                message: "error 500",
            };
            const errorResponseData: IErrorResponseData = { traceId, httpStatus: 500, rawData };
            renderReportMessage(errorResponseData, true);

            const showMoreLink = screen.queryByText(SHOW_RAW_RESPONSE_QUERY);
            expect(showMoreLink).not.toBeInTheDocument();
        });
    });
});
