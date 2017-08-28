import original from 'fetch-mock';
import { setFetch } from '../../src/utils/fetch';

const cloned = ['lastOptions', 'lastCall', 'call', 'calls', 'restore']
    .reduce((obj, method) => ({ ...obj, [method]: (...args) => original[method](...args) }), {});

const requestMethods = ['mock', 'get', 'post', 'put', 'delete', 'head']
    .reduce((obj, method) => {
        return {
            ...obj,
            [method](...args) {
                const mocked = original[method](...args);

                setFetch(original.fetchMock);

                return mocked;
            }
        };
    }, {});

export default {
    ...cloned,
    ...requestMethods
};
