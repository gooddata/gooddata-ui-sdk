// (C) 2019 GoodData Corporation
import { VisualizationInput } from '../VisualizationInput';
import IMeasure = VisualizationInput.IMeasure;
import IMeasureDefinitionType = VisualizationInput.IMeasureDefinitionType;
import IArithmeticMeasureDefinition = VisualizationInput.IArithmeticMeasureDefinition;

describe('VisualizationObject', () => {
    describe('isMeasure', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isMeasure(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isMeasure(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when visualization attribute is tested', () => {
            const attribute: VisualizationInput.IAttribute = {
                visualizationAttribute: {
                    localIdentifier: 'm1',
                    displayForm: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isMeasure(attribute);
            expect(result).toEqual(false);
        });

        it('should return true when measure is tested', () => {
            const measure: IMeasure = {
                measure: {
                    localIdentifier: 'm1',
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: '/gdc/mock/measure'
                            }
                        }
                    }
                }
            };
            const result = VisualizationInput.isMeasure(measure);
            expect(result).toEqual(true);
        });
    });

    describe('isAttribute', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isAttribute(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isAttribute(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when measure is tested', () => {
            const measure: IMeasure = {
                measure: {
                    localIdentifier: 'm1',
                    definition: {
                        measureDefinition: {
                            item: {
                                uri: '/gdc/mock/measure'
                            }
                        }
                    }
                }
            };
            const result = VisualizationInput.isAttribute(measure);
            expect(result).toEqual(false);
        });

        it('should return true when visualization attribute is tested', () => {
            const attribute: VisualizationInput.IAttribute = {
                visualizationAttribute: {
                    localIdentifier: 'm1',
                    displayForm: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isAttribute(attribute);
            expect(result).toEqual(true);
        });
    });

    describe('isMeasureDefinition', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when simple measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });

        it('should return false when arithmetic measure definition is tested', () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ['/gdc/mock/measure'],
                    operator: 'sum'
                }
            };
            const result = VisualizationInput.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return false when pop measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return false when previous period measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
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
            const result = VisualizationInput.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });
    });

    describe('isArithmeticMeasureDefinition', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isArithmeticMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isArithmeticMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when simple measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return true when arithmetic measure definition is tested', () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ['/gdc/mock/measure'],
                    operator: 'sum'
                }
            };
            const result = VisualizationInput.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });

        it('should return false when pop measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return false when previous period measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
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
            const result = VisualizationInput.isArithmeticMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });
    });

    describe('isPopMeasureDefinition', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isPopMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isPopMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when simple measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isPopMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return false when arithmetic measure definition is tested', () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ['/gdc/mock/measure'],
                    operator: 'sum'
                }
            };
            const result = VisualizationInput.isPopMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return true when pop measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isPopMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });

        it('should return false when previous period measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
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
            const result = VisualizationInput.isMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });
    });

    describe('isPreviousPeriodMeasureDefinition', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isPreviousPeriodMeasureDefinition(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isPreviousPeriodMeasureDefinition(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when simple measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                measureDefinition: {
                    item: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return false when arithmetic measure definition is tested', () => {
            const measureDefinition: IArithmeticMeasureDefinition = {
                arithmeticMeasure: {
                    measureIdentifiers: ['/gdc/mock/measure'],
                    operator: 'sum'
                }
            };
            const result = VisualizationInput.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return false when pop measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
                popMeasureDefinition: {
                    measureIdentifier: 'm1',
                    popAttribute: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(false);
        });

        it('should return true when previous period measure definition is tested', () => {
            const measureDefinition: IMeasureDefinitionType = {
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
            const result = VisualizationInput.isPreviousPeriodMeasureDefinition(measureDefinition);
            expect(result).toEqual(true);
        });
    });

    describe('isPositiveAttributeFilter', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isPositiveAttributeFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isPositiveAttributeFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when negative attribute filter is tested', () => {
            const filter: VisualizationInput.INegativeAttributeFilter = {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/date'
                    },
                    notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = VisualizationInput.isPositiveAttributeFilter(filter);
            expect(result).toEqual(false);
        });

        it('should return true when positive attribute filter is tested', () => {
            const filter: VisualizationInput.IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/attribute'
                    },
                    in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = VisualizationInput.isPositiveAttributeFilter(filter);
            expect(result).toEqual(true);
        });
    });

    describe('isAbsoluteDateFilter', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isAbsoluteDateFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isAbsoluteDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when relative date filter is tested', () => {
            const filter: VisualizationInput.IRelativeDateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/date'
                    },
                    granularity: 'GDC.time.year',
                    from: -1,
                    to: -1
                }
            };
            const result = VisualizationInput.isAbsoluteDateFilter(filter);
            expect(result).toEqual(false);
        });

        it('should return true when absolute date filter is tested', () => {
            const filter: VisualizationInput.IAbsoluteDateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/date'
                    },
                    from: '2017-06-12',
                    to: '2018-07-11'
                }
            };
            const result = VisualizationInput.isAbsoluteDateFilter(filter);
            expect(result).toEqual(true);
        });
    });

    describe('isRelativeDateFilter', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isRelativeDateFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isRelativeDateFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return false when absolute date filter is tested', () => {
            const filter: VisualizationInput.IAbsoluteDateFilter = {
                absoluteDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/date'
                    },
                    from: 'beginning',
                    to: 'to end'
                }
            };
            const result = VisualizationInput.isRelativeDateFilter(filter);
            expect(result).toEqual(false);
        });

        it('should return true when relative date filter is tested', () => {
            const filter: VisualizationInput.IRelativeDateFilter = {
                relativeDateFilter: {
                    dataSet: {
                        uri: '/gdc/mock/date'
                    },
                    granularity: 'GDC.time.year',
                    from: -1,
                    to: -1
                }
            };
            const result = VisualizationInput.isRelativeDateFilter(filter);
            expect(result).toEqual(true);
        });
    });

    describe('isMeasureValueFilter', () => {
        it('should return false when null is tested', () => {
            const result = VisualizationInput.isMeasureValueFilter(null);
            expect(result).toEqual(false);
        });

        it('should return false when undefined is tested', () => {
            const result = VisualizationInput.isMeasureValueFilter(undefined);
            expect(result).toEqual(false);
        });

        it('should return true when measure value filter is tested', () => {
            const filter: VisualizationInput.IMeasureValueFilter = {
                measureValueFilter: {
                    measure: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationInput.isMeasureValueFilter(filter);
            expect(result).toEqual(true);
        });

        it('should return false when positive attribute filter is tested', () => {
            const filter: VisualizationInput.IPositiveAttributeFilter = {
                positiveAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/mock/attribute'
                    },
                    in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                }
            };
            const result = VisualizationInput.isMeasureValueFilter(filter);
            expect(result).toEqual(false);
        });
    });
});
