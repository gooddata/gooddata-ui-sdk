// Copyright (C) 2007-2018, GoodData(R) Corporation. All rights reserved.
import { VisualizationObject } from '../VisualizationObject';
import IMeasure = VisualizationObject.IMeasure;
import IVisualizationAttribute = VisualizationObject.IVisualizationAttribute;
import BucketItem = VisualizationObject.BucketItem;
import VisualizationObjectAttributeFilter = VisualizationObject.VisualizationObjectAttributeFilter;
import VisualizationObjectDateFilter = VisualizationObject.VisualizationObjectDateFilter;
import VisualizationObjectFilter = VisualizationObject.VisualizationObjectFilter;

describe('VisualizationObject', () => {
    describe('isMeasure', () => {
        it('should return false when visualization attribute is tested', () => {
            const attribute: IVisualizationAttribute = {
                visualizationAttribute: {
                    localIdentifier: 'm1',
                    displayForm: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationObject.isMeasure(attribute);
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
            const result = VisualizationObject.isMeasure(measure);
            expect(result).toEqual(true);
        });
    });

    describe('isVisualizationAttribute', () => {
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
            const result = VisualizationObject.isVisualizationAttribute(measure);
            expect(result).toEqual(false);
        });

        it('should return true when visualization attribute is tested', () => {
            const attribute: IVisualizationAttribute = {
                visualizationAttribute: {
                    localIdentifier: 'm1',
                    displayForm: {
                        uri: '/gdc/mock/measure'
                    }
                }
            };
            const result = VisualizationObject.isVisualizationAttribute(attribute);
            expect(result).toEqual(true);
        });
    });

    describe('isMeasureDefinition', () => {
        describe('isAttributeFilter', () => {
            it('should return false when relative date filter is tested', () => {
                const filter: VisualizationObjectFilter = {
                    relativeDateFilter: {
                        dataSet: {
                            uri: '/gdc/mock/date'
                        },
                        granularity: 'GDC.time.year',
                        from: -1,
                        to: -1
                    }
                };
                const result = VisualizationObject.isAttributeFilter(filter);
                expect(result).toEqual(false);
            });

            it('should return true when negative attribute filter is tested', () => {
                const filter: VisualizationObjectFilter = {
                    negativeAttributeFilter: {
                        displayForm: {
                            uri: '/gdc/mock/date'
                        },
                        notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                    }
                };
                const result = VisualizationObject.isAttributeFilter(filter);
                expect(result).toEqual(true);
            });

            it('should return true when positive attribute filter is tested', () => {
                const filter: VisualizationObjectFilter = {
                    positiveAttributeFilter: {
                        displayForm: {
                            uri: '/gdc/mock/attribute'
                        },
                        in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                    }
                };
                const result = VisualizationObject.isAttributeFilter(filter);
                expect(result).toEqual(true);
            });
        });

        describe('isPositiveAttributeFilter', () => {
            it('should return false when negative attribute filter is tested', () => {
                const filter: VisualizationObjectAttributeFilter = {
                    negativeAttributeFilter: {
                        displayForm: {
                            uri: '/gdc/mock/date'
                        },
                        notIn: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                    }
                };
                const result = VisualizationObject.isPositiveAttributeFilter(filter);
                expect(result).toEqual(false);
            });

            it('should return true when positive attribute filter is tested', () => {
                const filter: VisualizationObjectAttributeFilter = {
                    positiveAttributeFilter: {
                        displayForm: {
                            uri: '/gdc/mock/attribute'
                        },
                        in: ['/gdc/mock/attribute/value_1', '/gdc/mock/attribute/value_2']
                    }
                };
                const result = VisualizationObject.isPositiveAttributeFilter(filter);
                expect(result).toEqual(true);
            });
        });

        describe('isAbsoluteDateFilter', () => {
            it('should return false when relative date filter is tested', () => {
                const filter: VisualizationObjectDateFilter = {
                    relativeDateFilter: {
                        dataSet: {
                            uri: '/gdc/mock/date'
                        },
                        granularity: 'GDC.time.year',
                        from: -1,
                        to: -1
                    }
                };
                const result = VisualizationObject.isAbsoluteDateFilter(filter);
                expect(result).toEqual(false);
            });

            it('should return true when absolute date filter is tested', () => {
                const filter: VisualizationObjectDateFilter = {
                    absoluteDateFilter: {
                        dataSet: {
                            uri: '/gdc/mock/date'
                        },
                        from: '2017-06-12',
                        to: '2018-07-11'
                    }
                };
                const result = VisualizationObject.isAbsoluteDateFilter(filter);
                expect(result).toEqual(true);
            });
        });

        describe('isAttribute', () => {
            it('should return false when measure is tested', () => {
                const measure: BucketItem = {
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
                const result = VisualizationObject.isAttribute(measure);
                expect(result).toEqual(false);
            });

            it('should return true when visualization attribute is tested', () => {
                const attribute: BucketItem = {
                    visualizationAttribute: {
                        localIdentifier: 'm1',
                        displayForm: {
                            uri: '/gdc/mock/measure'
                        }
                    }
                };
                const result = VisualizationObject.isAttribute(attribute);
                expect(result).toEqual(true);
            });
        });
    });
});
