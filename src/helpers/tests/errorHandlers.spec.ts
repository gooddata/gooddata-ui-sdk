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

describe('convertErrors', () => {
    it('should throw correct ErrorStates', () => {
        const error = new Error() as Execution.IError;
        error.response = { status: 0 };

        error.response.status = 204;
        expect(() => { convertErrors(error); }).toThrow(ErrorStates.NO_DATA);

        error.response.status = DataErrorCodes.HTTP_TOO_LARGE;
        expect(() => { convertErrors(error); }).toThrow(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);

        error.response.status = DataErrorCodes.HTTP_BAD_REQUEST;
        expect(() => { convertErrors(error); }).toThrow(ErrorStates.BAD_REQUEST);

        error.response.status = ErrorCodes.EMPTY_AFM;
        expect(() => { convertErrors(error); }).toThrow(ErrorStates.EMPTY_AFM);

        error.response.status = ErrorCodes.INVALID_BUCKETS;
        expect(() => { convertErrors(error); }).toThrow(ErrorStates.INVALID_BUCKETS);

        error.response.status = 0;
        expect(() => { convertErrors(error); }).toThrow(ErrorStates.UNKNOWN_ERROR);
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
