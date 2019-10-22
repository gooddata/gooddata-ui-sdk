// (C) 2019 GoodData Corporation
import { ExecuteAFM as AFM } from '../ExecuteAFM';
import CompatibilityFilter = AFM.CompatibilityFilter;

describe('AFM', () => {
    const expressionFilter: CompatibilityFilter = {
        value: 'MAQL'
    };
    const relativeDateFilter: CompatibilityFilter = {
        relativeDateFilter: {
            dataSet: {
                uri: '/gdc/mock/ds'
            },
            granularity: 'gram',
            from: -10,
            to: 0
        }
    };
    const absoluteDateFilter: CompatibilityFilter = {
        absoluteDateFilter: {
            dataSet: {
                uri: '/gdc/mock/ds'
            },
            from: '1',
            to: '2'
        }
    };
    const negativeAttributeFilter: CompatibilityFilter = {
        negativeAttributeFilter: {
            displayForm: {
                uri: '/gdc/mock/date'
            },
            notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
        }
    };
    const positiveAttributeFilter: CompatibilityFilter = {
        positiveAttributeFilter: {
            displayForm: {
                uri: '/gdc/mock/attribute'
            },
            in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
        }
    };
    const measureValueFilter: CompatibilityFilter = {
        measureValueFilter: {
            measure: {
                uri: '/gdc/mock/date'
            }
        }
    };

    describe('isDateFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isDateFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isDateFilter(relativeDateFilter);
            expect(result).toEqual(true);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isDateFilter(absoluteDateFilter);
            expect(result).toEqual(true);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isDateFilter(negativeAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isDateFilter(positiveAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isDateFilter(measureValueFilter);
            expect(result).toEqual(false);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isDateFilter(expressionFilter);
            expect(result).toEqual(false);
        });
    });

    describe('isRelativeDateFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isRelativeDateFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isRelativeDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isRelativeDateFilter(relativeDateFilter);
            expect(result).toEqual(true);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isRelativeDateFilter(absoluteDateFilter);
            expect(result).toEqual(false);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isRelativeDateFilter(negativeAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isRelativeDateFilter(positiveAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isRelativeDateFilter(measureValueFilter);
            expect(result).toEqual(false);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isRelativeDateFilter(expressionFilter);
            expect(result).toEqual(false);
        });
    });

    describe('isAbsoluteDateFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isAbsoluteDateFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isAbsoluteDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isAbsoluteDateFilter(relativeDateFilter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isAbsoluteDateFilter(absoluteDateFilter);
            expect(result).toEqual(true);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isAbsoluteDateFilter(negativeAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isAbsoluteDateFilter(positiveAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isAbsoluteDateFilter(measureValueFilter);
            expect(result).toEqual(false);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isAbsoluteDateFilter(expressionFilter);
            expect(result).toEqual(false);
        });
    });

    describe('isAttributeFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isAttributeFilter(relativeDateFilter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isAttributeFilter(absoluteDateFilter);
            expect(result).toEqual(false);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isAttributeFilter(negativeAttributeFilter);
            expect(result).toEqual(true);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isAttributeFilter(positiveAttributeFilter);
            expect(result).toEqual(true);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isAttributeFilter(measureValueFilter);
            expect(result).toEqual(false);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isAttributeFilter(expressionFilter);
            expect(result).toEqual(false);
        });
    });

    describe('isPositiveAttributeFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isPositiveAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isPositiveAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isPositiveAttributeFilter(relativeDateFilter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isPositiveAttributeFilter(absoluteDateFilter);
            expect(result).toEqual(false);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isPositiveAttributeFilter(negativeAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isPositiveAttributeFilter(positiveAttributeFilter);
            expect(result).toEqual(true);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isPositiveAttributeFilter(measureValueFilter);
            expect(result).toEqual(false);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isPositiveAttributeFilter(expressionFilter);
            expect(result).toEqual(false);
        });
    });

    describe('isNegativeAttributeFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isNegativeAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isNegativeAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isNegativeAttributeFilter(relativeDateFilter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isNegativeAttributeFilter(absoluteDateFilter);
            expect(result).toEqual(false);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isNegativeAttributeFilter(negativeAttributeFilter);
            expect(result).toEqual(true);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isNegativeAttributeFilter(positiveAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isNegativeAttributeFilter(measureValueFilter);
            expect(result).toEqual(false);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isNegativeAttributeFilter(expressionFilter);
            expect(result).toEqual(false);
        });
    });

    describe('isMeasureValueFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isMeasureValueFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isMeasureValueFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isMeasureValueFilter(relativeDateFilter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isMeasureValueFilter(absoluteDateFilter);
            expect(result).toEqual(false);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isMeasureValueFilter(negativeAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isMeasureValueFilter(positiveAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isMeasureValueFilter(measureValueFilter);
            expect(result).toEqual(true);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isMeasureValueFilter(expressionFilter);
            expect(result).toEqual(false);
        });
    });

    describe('isExpressionFilter', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isExpressionFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isExpressionFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const result = AFM.isExpressionFilter(relativeDateFilter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const result = AFM.isExpressionFilter(absoluteDateFilter);
            expect(result).toEqual(false);
        });

        it('should return false when negative attribute filter is tested', () => {
            const result = AFM.isExpressionFilter(negativeAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when positive attribute filter is tested', () => {
            const result = AFM.isExpressionFilter(positiveAttributeFilter);
            expect(result).toEqual(false);
        });

        it('should return false when measure value filter is tested', () => {
            const result = AFM.isExpressionFilter(measureValueFilter);
            expect(result).toEqual(false);
        });

        it('should return false when expression filter is tested', () => {
            const result = AFM.isExpressionFilter(expressionFilter);
            expect(result).toEqual(true);
        });
    });

    describe('isAttributeElementsArray', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isAttributeElementsArray(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isAttributeElementsArray(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when attr elements by ref', () => {
            const result = AFM.isAttributeElementsArray({ uris: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it('should return false when attr elements by value', () => {
            const result = AFM.isAttributeElementsArray({ values: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it('should return true when attr elements is array', () => {
            const result = AFM.isAttributeElementsArray(['a', 'b', 'c']);
            expect(result).toEqual(true);
        });
        it('should return true when attr elements is empty array', () => {
            const result = AFM.isAttributeElementsArray([]);
            expect(result).toEqual(true);
        });
    });

    describe('isAttributeElementsByRef', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isAttributeElementsByRef(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isAttributeElementsByRef(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when attr elements by ref', () => {
            const result = AFM.isAttributeElementsByRef({ uris: ['a', 'b', 'c'] });
            expect(result).toEqual(true);
        });
        it('should return false when attr elements by value', () => {
            const result = AFM.isAttributeElementsByRef({ values: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it('should return false when attr elements is array', () => {
            const result = AFM.isAttributeElementsByRef(['a', 'b', 'c']);
            expect(result).toEqual(false);
        });
        it('should return false when attr elements is empty array', () => {
            const result = AFM.isAttributeElementsByRef([]);
            expect(result).toEqual(false);
        });
    });

    describe('isAttributeElementsByValue', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isAttributeElementsByValue(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isAttributeElementsByValue(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when attr elements by ref', () => {
            const result = AFM.isAttributeElementsByValue({ uris: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it('should return true when attr elements by value', () => {
            const result = AFM.isAttributeElementsByValue({ values: ['a', 'b', 'c'] });
            expect(result).toEqual(true);
        });
        it('should return false when attr elements is array', () => {
            const result = AFM.isAttributeElementsByValue(['a', 'b', 'c']);
            expect(result).toEqual(false);
        });
        it('should return false when attr elements is empty array', () => {
            const result = AFM.isAttributeElementsByValue([]);
            expect(result).toEqual(false);
        });
    });
});
