// (C) 2023 GoodData Corporation
import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { convertApiError } from "../errorHandling";

describe("errorHandling", () => {
    describe("convertApiError", () => {
        test("convert to UnexpectedResponseError correctly", () => {
            const traceId = "adi_MSLFlr0ipb_74FAYdvoR1";
            const status = 500;
            const responseBody = `{"error":{"component":"GDCAQEAvailable","requestId":"adi_MSLFlr0ipb_74FAYdvoR1:G9B02Qd2l9fQ20oG:f0qt7kn5doypseq5","errorClass":"Base","parameters":["aqe_available","task_error"],"message":"Internal error [%s, %s]."}}`;

            const apiError = {
                message: "Internal server error",
                name: "API Error",
                response: {
                    status,
                    headers: new Map(
                        Object.entries({
                            "x-gdc-request": traceId,
                            "x-gdc-token": "token_MSLFlr0ipb_74FAYdvoR1",
                        }),
                    ),
                },
                responseBody,
            };
            const error = convertApiError(apiError);

            expect(error instanceof UnexpectedResponseError).toBeTruthy();

            const unexpectedResponseError = error as UnexpectedResponseError;
            expect(unexpectedResponseError.httpStatus).toBe(500);
            expect(unexpectedResponseError.traceId).toEqual(traceId);
            expect(unexpectedResponseError.responseBody).toEqual(responseBody);
        });
    });
});
