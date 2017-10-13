// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { getIn, queryString } from '../src/util';

describe('util', () => {
    const testObj = {
        a: 1,
        b: { c: { d: 2 } }
    };

    describe('getIn', () => {
        it('should return partially applied get', () => {
            expect(getIn('b.c.d')(testObj)).toBe(2);
        });

        it('should work as resolve function of promise', () => {
            return Promise.resolve(testObj).then(getIn('b.c')).then((result) => {
                expect(result).toEqual({ d: 2 });
            });
        });
    });

    describe('queryString', () => {
        it('should handle undefined', () => {
            expect(queryString(undefined)).toBe('');
        });

        it('should handle empty object', () => {
            expect(queryString({})).toBe('?');
        });

        it('should handle simple object', () => {
            expect(queryString({ aa: 123, bb: 'c & a' })).toBe('?aa=123&bb=c%20%26%20a');
        });

        it('should handle object with arrays', () => {
            expect(queryString({ ar: [1, 2, 'x'], b: false })).toBe('?ar=1&ar=2&ar=x&b=false');
        });
    });
});
