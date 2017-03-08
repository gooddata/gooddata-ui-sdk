import original from 'fetch-mock';
import { setFetch } from '../../src/utils/fetch';

const cloned = ['lastOptions', 'lastCall', 'call', 'calls', 'restore']
    .reduce((obj, method) => ({ ...obj, [method]: (...args) => original[method](...args) }), {});

export default {
    ...cloned,

    mock(...args) {
        const mocked = original.mock(...args);

        setFetch(original.mockedContext.fetch);

        return mocked;
    }
};
