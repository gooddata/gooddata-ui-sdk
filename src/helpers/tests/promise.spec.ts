import { getCancellable } from '../promise';
import { ErrorStates } from '../../constants/errorStates';

describe('getCancellable', () => {
    it('should return OK', () => {
        expect.assertions(1);
        const promise = Promise.resolve('OK');
        const cancellable = getCancellable(promise);

        return cancellable.promise.then((result: string) => expect(result).toEqual('OK'));
    });

    it('should let error flow when not cancelled', () => {
        expect.assertions(1);
        const promise = Promise.reject('ERR');
        const cancellable = getCancellable(promise);

        return cancellable.promise.then()
            .catch((error: string) => expect(error).toEqual('ERR'));
    });

    it('should set throw PROMISE_CANCELLED error on resolved', () => {
        expect.assertions(1);
        const promise = Promise.resolve('OK');
        const cancellable = getCancellable(promise);
        cancellable.cancel();

        return cancellable.promise.then()
            .catch((error: string) => expect(error).toEqual(ErrorStates.PROMISE_CANCELLED));
    });

    it('should throw PROMISE_CANCELLED error on rejected', () => {
        expect.assertions(1);
        const promise = Promise.reject('ERR');
        const cancellable = getCancellable(promise);
        cancellable.cancel();

        return cancellable.promise.then()
            .catch((error: string) => expect(error).toEqual(ErrorStates.PROMISE_CANCELLED));
    });
});
