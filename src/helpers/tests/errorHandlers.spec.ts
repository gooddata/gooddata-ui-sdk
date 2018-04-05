// (C) 2007-2018 GoodData Corporation
import { checkEmptyResult, convertErrors } from '../errorHandlers';
import { DataLayer, ApiResponseError } from 'gooddata';
import {
    emptyResponse,
    emptyResponseWithNull,
    attributeOnlyResponse
} from '../../execution/fixtures/ExecuteAfm.fixtures';
import { ErrorCodes, ErrorStates } from '../../constants/errorStates';
import {} from 'jest';

async function createMockedError(status: number, body: string = '{}') {
    const response = new Response(body, { status });

    // In gooddata-js, the response body is always read before the rejectio with ApiResponseError,
    // see https://github.com/gooddata/gooddata-js/blob/c5c985e9070d20ac359b988244b7bb1155661473/src/xhr.ts#L154-L155
    const responseBody = await response.text();

    return new ApiResponseError('Response error', response, responseBody);
}

describe('convertErrors', async () => {
    it('should throw correct ErrorStates', async () => {
        expect.assertions(7);
        try {
            await convertErrors(await createMockedError(204));
        } catch (e) {
            expect(e).toEqual(ErrorStates.NO_DATA);
        }

        try {
            await convertErrors(await createMockedError(DataLayer.ErrorCodes.HTTP_TOO_LARGE));
        } catch (e) {
            expect(e).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
        }

        try {
            await convertErrors(await createMockedError(DataLayer.ErrorCodes.HTTP_BAD_REQUEST));
        } catch (e) {
            expect(e).toEqual(ErrorStates.BAD_REQUEST);
        }

        try {
            const protectedErrorBody = `{
                "error": {
                    "message": "Attempt to execute protected report unsafely"
                }
            }`;

            await convertErrors(await createMockedError(DataLayer.ErrorCodes.HTTP_BAD_REQUEST, protectedErrorBody));
        } catch (e) {
            expect(e).toEqual(ErrorStates.PROTECTED_REPORT);
        }

        try {
            await convertErrors(await createMockedError(ErrorCodes.EMPTY_AFM));
        } catch (e) {
            expect(e).toEqual(ErrorStates.EMPTY_AFM);
        }

        try {
            await convertErrors(await createMockedError(ErrorCodes.INVALID_BUCKETS));
        } catch (e) {
            expect(e).toEqual(ErrorStates.INVALID_BUCKETS);
        }

        try {
            await convertErrors(await createMockedError(0));
        } catch (e) {
            expect(e).toEqual(ErrorStates.UNKNOWN_ERROR);
        }
    });
});

describe('checkEmptyResult', () => {
    it('should throw 204 if executionResult does not contain any data', () => {
        expect.hasAssertions();

        try {
            checkEmptyResult(emptyResponse);
        } catch (obj) {
            expect(obj.response.status).toEqual(204);
        }
    });

    it('should throw 204 if executionResult is null', () => {
        expect.hasAssertions();

        try {
            checkEmptyResult(emptyResponseWithNull);
        } catch (obj) {
            expect(obj.response.status).toEqual(204);
        }
    });

    it('should not throw 204 if executionResult does not contain any data, but contain headers', () => {
        expect(() => checkEmptyResult(attributeOnlyResponse)).not.toThrow();
    });
});
