// (C) 2019 GoodData Corporation
import { ExecuteAFM as AFM } from '../ExecuteAFM';
import CompatibilityFilter = AFM.CompatibilityFilter;

describe('AFM', () => {
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
            const filter: CompatibilityFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    granularity: 'gram',
                    from: -10,
                    to: 0
                }
            };
            const result = AFM.isDateFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return true when absolute date filter is tested', () => {
            const filter: CompatibilityFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    from: '1',
                    to: '2'
                }
            };
            const result = AFM.isDateFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return false when negative attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/date'
                    },
                    notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isDateFilter(filter);
            expect(result).toEqual(false);
        });

        it('should return false when positive attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/attribute'
                    },
                    in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isDateFilter(filter);
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
            const filter: CompatibilityFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    granularity: 'gram',
                    from: -10,
                    to: 0
                }
            };
            const result = AFM.isRelativeDateFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return false when absolute date filter is tested', () => {
            const filter: CompatibilityFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    from: '1',
                    to: '2'
                }
            };
            const result = AFM.isRelativeDateFilter(filter);
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

        it('should return false when relative date filter is tested', () => {
            const filter: CompatibilityFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    granularity: 'gram',
                    from: -10,
                    to: 0
                }
            };
            const result = AFM.isAbsoluteDateFilter(filter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const filter: CompatibilityFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    from: '1',
                    to: '2'
                }
            };
            const result = AFM.isAbsoluteDateFilter(filter);
            expect(result).toEqual(true);
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

        it('should return true when negative attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/date'
                    },
                    notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isAttributeFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return true when positive attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/attribute'
                    },
                    in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isAttributeFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return false when absolute date filter is tested', () => {
            const filter: CompatibilityFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    from: '1',
                    to: '2'
                }
            };
            const result = AFM.isAttributeFilter(filter);
            expect(result).toEqual(false);
        });

        it('should return false when relative date filter is tested', () => {
            const filter: CompatibilityFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/ds'
                    },
                    granularity: 'gram',
                    from: -10,
                    to: 0
                }
            };
            const result = AFM.isAttributeFilter(filter);
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

        it('should return false when negative attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/date'
                    },
                    notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isPositiveAttributeFilter(filter);
            expect(result).toEqual(false);
        });

        it('should return true when positive attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/attribute'
                    },
                    in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isPositiveAttributeFilter(filter);
            expect(result).toEqual(true);
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

        it('should return true when negative attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/date'
                    },
                    notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isNegativeAttributeFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return false when positive attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/attribute'
                    },
                    in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isNegativeAttributeFilter(filter);
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

        it('should return true when measure value filter is tested', () => {
            const filter: CompatibilityFilter = {
                measureValueFilter: {
                    measure: {
                        uri: '/gdc/mock/date'
                    }
                }
            };
            const result = AFM.isMeasureValueFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return false when positive attribute filter is tested', () => {
            const filter: CompatibilityFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/attribute'
                    },
                    in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = AFM.isMeasureValueFilter(filter);
            expect(result).toEqual(false);
        });
    });

    describe('isAttributeElementsArray', () => {
        it ('should return false when null is tested', () => {
            const result = AFM.isAttributeElementsArray(null);
            expect(result).toEqual(false);
        });

        it ('should return false when undefined is tested', () => {
            const result = AFM.isAttributeElementsArray(undefined);
            expect(result).toEqual(false);
        });

        it ('should return false when attr elements by ref', () => {
            const result = AFM.isAttributeElementsArray({ uris: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it ('should return false when attr elements by value', () => {
            const result = AFM.isAttributeElementsArray({ values: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it ('should return true when attr elements is array', () => {
            const result = AFM.isAttributeElementsArray(['a', 'b', 'c']);
            expect(result).toEqual(true);
        });
        it ('should return true when attr elements is empty array', () => {
            const result = AFM.isAttributeElementsArray([]);
            expect(result).toEqual(true);
        });
    });

    describe('isAttributeElementsByRef', () => {
        it ('should return false when null is tested', () => {
            const result = AFM.isAttributeElementsByRef(null);
            expect(result).toEqual(false);
        });

        it ('should return false when undefined is tested', () => {
            const result = AFM.isAttributeElementsByRef(undefined);
            expect(result).toEqual(false);
        });

        it ('should return true when attr elements by ref', () => {
            const result = AFM.isAttributeElementsByRef({ uris: ['a', 'b', 'c'] });
            expect(result).toEqual(true);
        });
        it ('should return false when attr elements by value', () => {
            const result = AFM.isAttributeElementsByRef({ values: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it ('should return false when attr elements is array', () => {
            const result = AFM.isAttributeElementsByRef(['a', 'b', 'c']);
            expect(result).toEqual(false);
        });
        it ('should return false when attr elements is empty array', () => {
            const result = AFM.isAttributeElementsByRef([]);
            expect(result).toEqual(false);
        });
    });

    describe('isAttributeElementsByValue', () => {
        it ('should return false when null is tested', () => {
            const result = AFM.isAttributeElementsByValue(null);
            expect(result).toEqual(false);
        });

        it ('should return false when undefined is tested', () => {
            const result = AFM.isAttributeElementsByValue(undefined);
            expect(result).toEqual(false);
        });

        it ('should return false when attr elements by ref', () => {
            const result = AFM.isAttributeElementsByValue({ uris: ['a', 'b', 'c'] });
            expect(result).toEqual(false);
        });
        it ('should return true when attr elements by value', () => {
            const result = AFM.isAttributeElementsByValue({ values: ['a', 'b', 'c'] });
            expect(result).toEqual(true);
        });
        it ('should return false when attr elements is array', () => {
            const result = AFM.isAttributeElementsByValue(['a', 'b', 'c']);
            expect(result).toEqual(false);
        });
        it ('should return false when attr elements is empty array', () => {
            const result = AFM.isAttributeElementsByValue([]);
            expect(result).toEqual(false);
        });
    });
});
