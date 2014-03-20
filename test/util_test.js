// Copyright (C) 2007-2014, GoodData(R) Corporation. All rights reserved.
define(['util', 'jquery'], function(util, $) {
    describe('util', function() {
        before(function() {
            this.testObj = {
                'a': 1,
                'b': { 'c' : { 'd': 2 } }
            };
        });
        describe('getPath', function() {
            it('should return value for 1 step', function() {
                expect(util.getPath(this.testObj, 'a')).to.be(1);
            });
            it('should return value for nested path', function() {
                expect(util.getPath(this.testObj, 'b.c.d')).to.be(2);
            });
            it('should return undefined for non-existant key', function() {
                expect(util.getPath(this.testObj, 'e')).to.be(undefined);
            });
            it('should return undefined for non-existant key in nested path', function() {
                expect(util.getPath(this.testObj, 'ab.cd.ef')).to.be(undefined);
            });
        });

        describe('getIn', function() {
            it('should return partially applied getPath', function() {
                expect(util.getIn('b.c.d')(this.testObj)).to.be(2);
            });
        });
    });

});

