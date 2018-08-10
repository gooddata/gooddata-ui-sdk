// (C) 2007-2018 GoodData Corporation
import { getObjectIdFromUri, setTelemetryHeaders, unwrap } from '../utils';
import { factory as createSdk } from '@gooddata/gooddata-js';

describe('getObjectIdFromUri', () => {
    it('should extract object id from uris', () => {
        expect(getObjectIdFromUri('/gdc/md/aadsf234234234324/obj/ABC')).toBe('ABC');
        expect(getObjectIdFromUri('/gdc/md/aadsf234234234324/obj/123/sdfghjkhgfd')).toBe('123');
        expect(getObjectIdFromUri('/gdc/md/aadsf234234234324/obj/DEF_456?XXX')).toBe('DEF_456');
    });

    it('should return null if it cannot find the uri', () => {
        expect(getObjectIdFromUri('/uri/without/objectId')).toBe(null);
    });
});

describe('setTelemetryHeaders', () => {
    it('should set telemetry headers', () => {
        const sdk = createSdk();
        setTelemetryHeaders(sdk, 'componentName', { prop: 'value' });

        expect(sdk.config.getJsPackage()).toMatchObject({
            name: '@gooddata/react-components',
            version: expect.any(String)
        });

        expect(sdk.config.getRequestHeader('X-GDC-JS-SDK-COMP')).toEqual('componentName');
        expect(sdk.config.getRequestHeader('X-GDC-JS-SDK-COMP-PROPS')).toEqual('prop');
    });
});

describe('unwrap', () => {
    it('should unwrap an object', () => {
        expect(unwrap({ key: 'value' })).toEqual('value');
    });
});
