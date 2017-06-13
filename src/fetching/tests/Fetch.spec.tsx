import * as React from 'react';
import { mount } from 'enzyme';

import { Fetch } from '../Fetch';

describe('Fetch', () => {
    it('should fetch data on componentDidMount', async () => {
        const response = Promise.resolve(true);
        const onData = jest.fn();
        const onError = jest.fn();
        const fetcher = jest.fn(() => response);

        mount(
            <Fetch
                uri="/my/uri"
                fetcher={fetcher}
                onData={onData}
                onError={onError}
            />
        );

        await response;
        expect(onData).toHaveBeenCalledWith(true);
        expect(fetcher).toHaveBeenCalledWith('/my/uri');
        expect(onError).not.toHaveBeenCalled();
    });

    it('should fetch data on willReceiveProps', async () => {
        const response = Promise.resolve(true);
        const onData = jest.fn();
        const onError = jest.fn();
        const fetcher = jest.fn(() => response);

        const wrapper = mount(
            <Fetch
                uri="/my/uri"
                fetcher={fetcher}
                onData={onData}
                onError={onError}
            />
        );

        wrapper.setProps({ uri: '/different/uri' });
        await response;

        expect(fetcher).toHaveBeenCalledWith('/different/uri');
        expect(onData).toHaveBeenCalledWith(true);
        expect(onError).not.toHaveBeenCalled();
    });

    it('should trigger onError in case request fails', async () => {
        const response = Promise.reject(false);
        const onData = jest.fn();
        const onError = jest.fn();
        const fetcher = jest.fn(() => response);

        const wrapper = mount(
            <Fetch
                uri="/my/uri"
                fetcher={fetcher}
                onData={onData}
                onError={onError}
            />
        );

        wrapper.setProps({ uri: '/different/uri' });

        try {
            await response;
            expect(fetcher).toHaveBeenCalledWith('/different/uri');
            expect(onData).not.toHaveBeenCalled();
            expect(onError).toHaveBeenCalledWith(false);
        } catch (err) {
            expect(err).toBe(false);
        }

    });

    it('should not fetch data if uri did not change', async () => {
        const response = Promise.resolve(true);
        const onData = jest.fn();
        const onError = jest.fn();
        const fetcher = jest.fn(() => response);

        const wrapper = mount(
            <Fetch
                uri="/my/uri"
                fetcher={fetcher}
                onData={onData}
                onError={onError}
            />
        );

        wrapper.setProps({ uri: '/my/uri' });
        await response;

        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(fetcher).toHaveBeenCalledWith('/my/uri');
        expect(onData).toHaveBeenCalledTimes(1);
        expect(onData).toHaveBeenCalledWith(true);
        expect(onError).not.toHaveBeenCalled();
    });
});
