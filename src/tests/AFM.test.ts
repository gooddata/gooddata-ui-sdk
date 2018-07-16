// Copyright (C) 2007-2018, GoodData(R) Corporation. All rights reserved.
import { AFM } from '../AFM';
import CompatibilityFilter = AFM.CompatibilityFilter;
import MeasureDefinition = AFM.MeasureDefinition;
import ObjQualifier = AFM.ObjQualifier;
import LocatorItem = AFM.LocatorItem;
import SortItem = AFM.SortItem;

describe('AFM', () => {
    describe('isObjectUriQualifier', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isObjectUriQualifier(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isObjectUriQualifier(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when identifier object qualifier is tested', () => {
            const objectQualifier: ObjQualifier = {
                identifier: 'id'
            };
            const result = AFM.isObjectUriQualifier(objectQualifier);
            expect(result).toEqual(false);
        });

        it('should return true when uri object qualifier is tested', () => {
            const objectQualifier: ObjQualifier = {
                uri: '/gdc/mock/id'
            };
            const result = AFM.isObjectUriQualifier(objectQualifier);
            expect(result).toEqual(true);
        });
    });

    describe('isSimpleMeasureDefinition', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isSimpleMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isSimpleMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when simple measure definition is tested', () => {
            const measure: MeasureDefinition = {
                measure: {
                    item: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = AFM.isSimpleMeasureDefinition(measure);
            expect(result).toEqual(true);
        });

        it('should return false when pop measure definition is tested', () => {
            const measure: MeasureDefinition = {
                popMeasure: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = AFM.isSimpleMeasureDefinition(measure);
            expect(result).toEqual(false);
        });

        it('should return false when previous period measure definition is tested', () => {
            const measure: MeasureDefinition = {
                previousPeriodMeasure: {
                    measureIdentifier: 'm1',
                    dateDataSets: [{
                        dataSet: {
                            uri: '/gdc/mock/date'
                        },
                        periodsAgo: 1
                    }]
                }
            };
            const result = AFM.isSimpleMeasureDefinition(measure);
            expect(result).toEqual(false);
        });
    });

    describe('isPopMeasureDefinition', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isPopMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isPopMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when simple measure definition is tested', () => {
            const measure: MeasureDefinition = {
                measure: {
                    item: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = AFM.isPopMeasureDefinition(measure);
            expect(result).toEqual(false);
        });

        it('should return true when pop measure definition is tested', () => {
            const measure: MeasureDefinition = {
                popMeasure: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = AFM.isPopMeasureDefinition(measure);
            expect(result).toEqual(true);
        });

        it('should return false when previous period measure definition is tested', () => {
            const measure: MeasureDefinition = {
                previousPeriodMeasure: {
                    measureIdentifier: 'm1',
                    dateDataSets: [{
                        dataSet: {
                            uri: '/gdc/mock/date'
                        },
                        periodsAgo: 1
                    }]
                }
            };
            const result = AFM.isSimpleMeasureDefinition(measure);
            expect(result).toEqual(false);
        });
    });

    describe('isPreviousPeriodMeasureDefinition', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isPreviousPeriodMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isPreviousPeriodMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when simple measure definition is tested', () => {
            const measure: MeasureDefinition = {
                measure: {
                    item: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = AFM.isPreviousPeriodMeasureDefinition(measure);
            expect(result).toEqual(false);
        });

        it('should return false when pop measure definition is tested', () => {
            const measure: MeasureDefinition = {
                popMeasure: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = AFM.isPreviousPeriodMeasureDefinition(measure);
            expect(result).toEqual(false);
        });

        it('should return true when previous period measure definition is tested', () => {
            const measure: MeasureDefinition = {
                previousPeriodMeasure: {
                    measureIdentifier: 'm1',
                    dateDataSets: [{
                        dataSet: {
                            uri: '/gdc/mock/date'
                        },
                        periodsAgo: 1
                    }]
                }
            };
            const result = AFM.isPreviousPeriodMeasureDefinition(measure);
            expect(result).toEqual(true);
        });
    });

    describe('isAttributeSortItem', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isAttributeSortItem(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isAttributeSortItem(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when attribute sort item is tested', () => {
            const sortItem: SortItem = {
                attributeSortItem: {
                    direction: 'asc',
                    attributeIdentifier: 'a1'
                }
            };
            const result = AFM.isAttributeSortItem(sortItem);
            expect(result).toEqual(true);
        });

        it('should return false when measure sort item is tested', () => {
            const sortItem: SortItem = {
                measureSortItem: {
                    direction: 'asc',
                    locators: [{
                        measureLocatorItem: {
                            measureIdentifier: 'm1'
                        }
                    }]
                }
            };
            const result = AFM.isAttributeSortItem(sortItem);
            expect(result).toEqual(false);
        });
    });

    describe('isMeasureSortItem', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isMeasureSortItem(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isMeasureSortItem(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when attribute sort item is tested', () => {
            const sortItem: SortItem = {
                attributeSortItem: {
                    direction: 'asc',
                    attributeIdentifier: 'a1'
                }
            };
            const result = AFM.isMeasureSortItem(sortItem);
            expect(result).toEqual(false);
        });

        it('should return true when measure sort item is tested', () => {
            const sortItem: SortItem = {
                measureSortItem: {
                    direction: 'asc',
                    locators: [{
                        measureLocatorItem: {
                            measureIdentifier: 'm1'
                        }
                    }]
                }
            };
            const result = AFM.isMeasureSortItem(sortItem);
            expect(result).toEqual(true);
        });
    });

    describe('isMeasureLocatorItem', () => {
        it('should return false when null is tested', () => {
            const result = AFM.isMeasureLocatorItem(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = AFM.isMeasureLocatorItem(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when attribute locator is tested', () => {
            const locatorItem: LocatorItem = {
                attributeLocatorItem: {
                    attributeIdentifier: 'a1',
                    element: 'element'
                }
            };
            const result = AFM.isMeasureLocatorItem(locatorItem);
            expect(result).toEqual(false);
        });

        it('should return true when measure locator filter is tested', () => {
            const locatorItem: LocatorItem = {
                measureLocatorItem: {
                    measureIdentifier: 'm1'
                }
            };
            const result = AFM.isMeasureLocatorItem(locatorItem);
            expect(result).toEqual(true);
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
});
