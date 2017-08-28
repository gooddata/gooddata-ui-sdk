// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
import { getIn } from '../src/util';

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
});
