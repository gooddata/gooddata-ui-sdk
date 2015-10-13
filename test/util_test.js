// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names: 0 */
import * as util from '../src/util';

describe('util', () => {
    let testObj;
    before(function() {
        testObj = {
            'a': 1,
            'b': { 'c': { 'd': 2 } }
        };
    });
    describe('getPath', () => {
        it('should return value for 1 step', () => {
            expect(util.getPath(testObj, 'a')).to.be(1);
        });
        it('should return value for nested path', () => {
            expect(util.getPath(testObj, 'b.c.d')).to.be(2);
        });
        it('should return undefined for non-existant key', () => {
            expect(util.getPath(testObj, 'e')).to.be(undefined);
        });
        it('should return undefined for non-existant key in nested path', () => {
            expect(util.getPath(testObj, 'ab.cd.ef')).to.be(undefined);
        });
    });

    describe('getIn', () => {
        it('should return partially applied getPath', () => {
            expect(util.getIn('b.c.d')(testObj)).to.be(2);
        });
    });
});


