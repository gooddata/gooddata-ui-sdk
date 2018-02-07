import { checkEmptyResult, convertErrors } from '../errorHandlers';
import { Execution } from '@gooddata/typings';
import { ErrorCodes as DataErrorCodes } from '@gooddata/data-layer';
import {
    emptyResponse,
    emptyResponseWithNull,
    attributeOnlyResponse
} from '../../execution/fixtures/ExecuteAfm.fixtures';
import { ErrorCodes, ErrorStates } from '../../constants/errorStates';
import {} from 'jest';

function createMockedError(status: number, body: string = '{}'): Execution.IError {
    const error = new Error() as Execution.IError;
    error.response = {
        status,
        body: null as ReadableStream | null, // tslint:disable-line
        bodyUsed: false,
        headers: null,
        ok: true,
        statusText: '',
        type: 'error',
        url: '',
        json: jest.fn(() => {
            return Promise.resolve(JSON.parse(body));
        }),
        text: jest.fn(() => {
            return Promise.resolve(body);
        }),
        clone: jest.fn(),
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn()
    };

    return error;
}

describe('convertErrors', async () => {
    it('should throw correct ErrorStates', async () => {
        expect.assertions(7);
        try {
            await convertErrors(createMockedError(204));
        } catch (e) {
            expect(e).toEqual(ErrorStates.NO_DATA);
        }

        try {
            await convertErrors(createMockedError(DataErrorCodes.HTTP_TOO_LARGE));
        } catch (e) {
            expect(e).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
        }

        try {
            await convertErrors(createMockedError(DataErrorCodes.HTTP_BAD_REQUEST));
        } catch (e) {
            expect(e).toEqual(ErrorStates.BAD_REQUEST);
        }

        try {
            const protectedErrorBody = `{
                "error": {
                    "message": "Attempt to execute protected report unsafely"
                }
            }`;

            await convertErrors(createMockedError(DataErrorCodes.HTTP_BAD_REQUEST, protectedErrorBody));
        } catch (e) {
            expect(e).toEqual(ErrorStates.PROTECTED_REPORT);
        }

        try {
            await convertErrors(createMockedError(ErrorCodes.EMPTY_AFM));
        } catch (e) {
            expect(e).toEqual(ErrorStates.EMPTY_AFM);
        }

        try {
            await convertErrors(createMockedError(ErrorCodes.INVALID_BUCKETS));
        } catch (e) {
            expect(e).toEqual(ErrorStates.INVALID_BUCKETS);
        }

        try {
            await convertErrors(createMockedError(0));
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
