// (C) 2018 GoodData Corporation
import { absoluteDateFilter, negativeAttributeFilter, positiveAttributeFilter, relativeDateFilter } from '../filters';

describe('Filters', () => {
    describe('positiveAttributeFilter', () => {
        it('should generate correct filter', () => {
            expect(positiveAttributeFilter('foo', ['bar', 'baz'])).toEqual({
                positiveAttributeFilter: {
                    displayForm: {
                        identifier: 'foo'
                    },
                    in: ['bar', 'baz']
                }
            });
        });
    });

    describe('negativeAttributeFilter', () => {
        it('should generate correct filter', () => {
            expect(negativeAttributeFilter('foo', ['bar', 'baz'])).toEqual({
                negativeAttributeFilter: {
                    displayForm: {
                        identifier: 'foo'
                    },
                    notIn: ['bar', 'baz']
                }
            });
        });
    });

    describe('absoluteDateFilter', () => {
        it('should generate correct filter', () => {
            expect(absoluteDateFilter('foo', '2018-01-01', '2018-12-31')).toEqual({
                absoluteDateFilter: {
                    dataSet: {
                        identifier: 'foo'
                    },
                    from: '2018-01-01',
                    to: '2018-12-31'
                }
            });
        });
    });

    describe('relativeDateFilter', () => {
        it('should generate correct filter', () => {
            expect(relativeDateFilter('foo', 'quarter', 1, 3)).toEqual({
                relativeDateFilter: {
                    dataSet: {
                        identifier: 'foo'
                    },
                    granularity: 'quarter',
                    from: 1,
                    to: 3
                }
            });
        });
    });
});
