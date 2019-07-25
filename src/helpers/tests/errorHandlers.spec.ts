// (C) 2007-2018 GoodData Corporation
import * as HttpStatusCodes from "http-status-codes";
import { checkEmptyResult, convertErrors, generateErrorMap, hasDuplicateIdentifiers } from "../errorHandlers";
import { ApiResponseError } from "@gooddata/gooddata-js";
import "isomorphic-fetch";

import {
    emptyResponse,
    emptyResponseWithNull,
    attributeOnlyResponse,
} from "../../execution/fixtures/ExecuteAfm.fixtures";
import { ErrorCodes, ErrorStates } from "../../constants/errorStates";
import { RuntimeError } from "../../errors/RuntimeError";
import "jest";
import { VisualizationObject } from "@gooddata/typings/dist";

async function createMockedError(status: number, body: string = "{}") {
    const response = new Response(body, { status });

    // In gooddata-js, the response body is always read before the rejectio with ApiResponseError,
    // see https://github.com/gooddata/gooddata-js/blob/c5c985e9070d20ac359b988244b7bb1155661473/src/xhr.ts#L154-L155
    const responseBody = await response.text();

    return new ApiResponseError("Response error", response, responseBody);
}

async function createTypeError() {
    return new TypeError("TypeError message");
}

describe("convertErrors", () => {
    it("should return RuntimeError with message when error type is not ApiResponseError", async () => {
        const e = convertErrors(await createTypeError());

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual("TypeError message");
    });

    it("should return `NO_DATA` error", async () => {
        const e = convertErrors(await createMockedError(204));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.NO_DATA);
    });

    it("should return `DATA_TOO_LARGE_TO_COMPUTE` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.REQUEST_TOO_LONG));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
    });

    it("should return `BAD_REQUEST` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.BAD_REQUEST));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.BAD_REQUEST);
    });

    it("should return `UNAUTHORIZED` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.UNAUTHORIZED));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.UNAUTHORIZED);
    });

    it("should return `NOT_FOUND` error", async () => {
        const e = convertErrors(await createMockedError(HttpStatusCodes.NOT_FOUND));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.NOT_FOUND);
    });

    it("should return `PROTECTED_REPORT` error", async () => {
        const protectedErrorBody = `{
                "error": {
                    "message": "Attempt to execute protected report unsafely"
                }
            }`;

        const e = convertErrors(await createMockedError(HttpStatusCodes.BAD_REQUEST, protectedErrorBody));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.PROTECTED_REPORT);
    });

    it("should return `EMPTY_AFM` error", async () => {
        const e = convertErrors(await createMockedError(ErrorCodes.EMPTY_AFM));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.EMPTY_AFM);
    });

    it("should return `INVALID_BUCKETS` error", async () => {
        const e = convertErrors(await createMockedError(ErrorCodes.INVALID_BUCKETS));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.INVALID_BUCKETS);
    });

    it("should return `UNKNOWN_ERROR` error", async () => {
        const e = convertErrors(await createMockedError(0));

        expect(e).toBeInstanceOf(RuntimeError);
        expect(e.message).toEqual(ErrorStates.UNKNOWN_ERROR);
    });
});

describe("checkEmptyResult", () => {
    it("should throw 204 if executionResult does not contain any data", () => {
        expect.hasAssertions();

        try {
            checkEmptyResult(emptyResponse);
        } catch (obj) {
            expect(obj.response.status).toEqual(204);
        }
    });

    it("should throw 204 if executionResult is null", () => {
        expect.hasAssertions();

        try {
            checkEmptyResult(emptyResponseWithNull);
        } catch (obj) {
            expect(obj.response.status).toEqual(204);
        }
    });

    it("should not throw 204 if executionResult does not contain any data, but contain headers", () => {
        expect(() => checkEmptyResult(attributeOnlyResponse)).not.toThrow();
    });
});

describe("generateErrorMap", () => {
    it("should generate map", () => {
        const intlMock = {
            formatMessage: ({ id }: { id: string }) => id,
        };
        const map = generateErrorMap(intlMock as any);
        expect(map).toMatchSnapshot();
    });
});

describe("hasDuplicateIdentifiers", () => {
    const buckets: VisualizationObject.IBucket[] = [
        {
            localIdentifier: "measures",
            items: [
                {
                    measure: {
                        localIdentifier: "abc",
                        definition: {
                            measureDefinition: {
                                item: {
                                    identifier: "aaEGaXAEgB7U",
                                },
                            },
                        },
                    },
                },
                {
                    measure: {
                        localIdentifier: "def",
                        definition: {
                            measureDefinition: {
                                item: {
                                    identifier: "aabHeqImaK0d",
                                },
                            },
                        },
                    },
                },
            ],
        },
        {
            localIdentifier: "rows",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "ghi",
                        displayForm: {
                            identifier: "label.restaurantlocation.locationstate",
                        },
                    },
                },
                {
                    visualizationAttribute: {
                        localIdentifier: "jkl",
                        displayForm: {
                            identifier: "label.restaurantlocation.locationname",
                        },
                    },
                },
                {
                    visualizationAttribute: {
                        localIdentifier: "abc",
                        displayForm: {
                            identifier: "label.menuitem.menucategory",
                        },
                    },
                },
            ],
        },
        {
            localIdentifier: "columns",
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: "def",
                        displayForm: {
                            identifier: "date.aam81lMifn6q",
                        },
                    },
                },
                {
                    visualizationAttribute: {
                        localIdentifier: "xyz",
                        displayForm: {
                            identifier: "date.abm81lMifn6q",
                        },
                    },
                },
            ],
        },
    ];
    it("should return true if there are duplicate identifiers", () => {
        const hasDuplicates = hasDuplicateIdentifiers(buckets);
        expect(hasDuplicates).toBe(true);
    });
    it("should return false if there are duplicate identifiers", () => {
        const hasDuplicates = hasDuplicateIdentifiers(buckets.slice(1));
        expect(hasDuplicates).toBe(false);
    });
});
