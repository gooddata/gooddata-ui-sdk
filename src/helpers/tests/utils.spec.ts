// (C) 2007-2018 GoodData Corporation
import { getObjectIdFromUri } from '../utils';

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
