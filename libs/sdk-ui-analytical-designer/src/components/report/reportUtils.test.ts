// (C) 2023-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { extractErrorResponseData, parseRawDataToTextareaContent } from "./reportUtils.js";

describe("reportUtils", () => {
    describe("parseRawDataToTextareaContent", () => {
        it("parse data field non array/object correctly", () => {
            const content = parseRawDataToTextareaContent({
                traceId: "trace_id",
                status: 500,
            });

            expect(content).toMatchSnapshot();
        });

        it("parse object correctly", () => {
            const content = parseRawDataToTextareaContent({
                error: {
                    status: 400,
                    emptyObject: {},
                    error: {
                        message: "error message",
                        detail: "error detail",
                    },
                },
                emptyObject: {},
            });

            expect(content).toMatchSnapshot();
        });

        it("parse array correctly", () => {
            const content = parseRawDataToTextareaContent({
                error: [
                    "error_1",
                    "error_2",
                    {
                        error: {
                            message: "error message",
                            detail: "error detail",
                        },
                        subError: ["error_1", "error_2"],
                        emptyArray: [],
                    },
                ],
                emptyArray: [],
            });

            expect(content).toMatchSnapshot();
        });

        it("parse rawData correctly", () => {
            const content = parseRawDataToTextareaContent({
                errorArray: [
                    "error_1",
                    "error_2",
                    {
                        error: {
                            message: "error message",
                            detail: "error detail",
                        },
                        subError: ["error_1", "error_2"],
                        emptyArray: [],
                        emptyObject: {},
                    },
                ],
                errorObj: {
                    message: "error message",
                    detail: "error detail",
                    traceId: "trace_id",
                },
                httpStatus: 400,
            });

            expect(content).toMatchSnapshot();
        });

        it("parse object/array as a string when exceed limit recursive", () => {
            const content = parseRawDataToTextareaContent({
                error: {
                    status: 400,
                    emptyObject: {},
                    error: {
                        message: "error message",
                        detail: "error detail",
                        error: {
                            message: "error message",
                            detail: "error detail",
                            error: {
                                message: "error message",
                                detail: "error detail",
                                error: {
                                    message: "error message",
                                    detail: "error detail",
                                    error: {
                                        message: "error message",
                                        detail: "error detail",
                                        errorArray: ["error_1", "error_2"],
                                    },
                                },
                                errorArray: ["error_1", "error_2"],
                            },
                            errorArray: [
                                "error_1",
                                "error_2",
                                {
                                    message: "error message",
                                    detail: "error detail",
                                },
                            ],
                        },
                    },
                },
            });

            expect(content).toMatchSnapshot();
        });
    });

    describe("extractErrorResponseData", () => {
        it("should return null if cause is null or undefined", () => {
            expect(extractErrorResponseData({})).toBeNull();
            expect(extractErrorResponseData(null)).toBeNull();
            expect(extractErrorResponseData({ cause: null })).toBeNull();
        });

        it("should return error response data with response body is string", () => {
            const cause = {
                httpStatus: 500,
                traceId: "trace_id",
                responseBody: `{"error":{"component":"GDCAQEAvailable","requestId":"adi_MSLFlr0ipb_74FAYdvoR1:G9B02Qd2l9fQ20oG:f0qt7kn5doypseq5","errorClass":"Base","parameters":["aqe_available","task_error"],"message":"Internal error [%s, %s]."}}`,
            };
            expect(extractErrorResponseData({ cause })).toEqual({
                traceId: cause.traceId,
                httpStatus: cause.httpStatus,
                rawData: JSON.parse(cause.responseBody),
            });
        });

        it("should return raw data is empty object when response body string is invalid format", () => {
            const cause = {
                httpStatus: 500,
                traceId: "trace_id",
                responseBody: `{"error":{"component":"GDCAQEAvailable","requestId":"adi_MSLFlr0ipb_74FAYdvoR1:G9B02Qd2l9fQ20oG:f0qt7kn5doypseq5","errorClass":"Base","parameters":["aqe_available","task_error"],"message":"Internal error [%s, %s]."}`,
            };
            expect(extractErrorResponseData({ cause })).toEqual({
                traceId: cause.traceId,
                httpStatus: cause.httpStatus,
                rawData: {},
            });
        });

        it("should return error response data with response body is object", () => {
            const cause = {
                httpStatus: 500,
                traceId: "trace_id",
                responseBody: {
                    message: "Internal server error",
                    detail: "Contact your administrator for more information",
                },
            };
            expect(extractErrorResponseData({ cause })).toEqual({
                traceId: cause.traceId,
                httpStatus: cause.httpStatus,
                rawData: cause.responseBody,
            });
        });
    });
});
