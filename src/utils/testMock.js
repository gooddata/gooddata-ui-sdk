import fetchMock from 'fetch-mock';
import * as config from '../../src/config';

export const mock = (...args) => {
    const mocked = fetchMock.mock(...args);
    config.setFetch(fetchMock.mockedContext.fetch);

    return mocked;
};

export const restore = () => {
    fetchMock.restore();
};

export const getMock = () => {
    return fetchMock;
};
