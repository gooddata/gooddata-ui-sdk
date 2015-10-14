// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
/* eslint func-names: 0 */
import { getIn } from '../src/util';
import $ from 'jquery';

describe('util', () => {
    let testObj;
    before(function() {
        testObj = {
            'a': 1,
            'b': { 'c': { 'd': 2 } }
        };
    });

    describe('getIn', () => {
        it('should return partially applied get', () => {
            expect(getIn('b.c.d')(testObj)).to.be(2);
        });

        it('should work as resolve function of promise', done => {
            /* eslint-disable new-cap */
            const d = $.Deferred();
            /* eslint-enable new-cap */
            d.then(getIn('b.c')).then(function resolve(result) {
                expect(result).to.eql({d: 2});
                done();
            });

            d.resolve(testObj, {}, {});
        });
    });
});


