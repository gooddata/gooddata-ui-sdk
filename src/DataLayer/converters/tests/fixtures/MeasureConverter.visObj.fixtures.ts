// (C) 2007-2018 GoodData Corporation
import { VisualizationObject } from '@gooddata/typings';
import IMeasure = VisualizationObject.IMeasure;

export const simpleMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                }
            }
        }
    }
};

export const simpleMeasureWithIdentifiers: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        definition: {
            measureDefinition: {
                item: {
                    identifier: 'metric.id'
                }
            }
        }
    }
};

export const simpleMeasureWithFormat: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        format: 'GD #,##0.00000',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                }
            }
        }
    }
};

export const renamedMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Alias A1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                }
            }
        }
    }
};

export const filteredMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                },
                filters: [
                    {
                        positiveAttributeFilter: {
                            displayForm: {
                                uri: '/gdc/md/project/obj/1'
                            },
                            in: [
                                `${'/gdc/md/project/obj/11'}?id=1`,
                                `${'/gdc/md/project/obj/11'}?id=2`
                            ]
                        }
                    }
                ]
            }
        }
    }
};

export const measureWithRelativeDate: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                },
                filters: [
                    {
                        relativeDateFilter: {
                            dataSet: {
                                uri: '/gdc/md/project/333'
                            },
                            granularity: 'GDC.time.date',
                            from: -89,
                            to: 0
                        }
                    }, {
                        positiveAttributeFilter: {
                            displayForm: {
                                uri: '/gdc/md/project/obj/1'
                            },
                            in: [
                                `${'/gdc/md/project/obj/11'}?id=1`,
                                `${'/gdc/md/project/obj/11'}?id=2`
                            ]
                        }
                    }
                ]
            }
        }
    }
};

export const measureWithAbsoluteDate: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                },
                filters: [
                    {
                        absoluteDateFilter: {
                            dataSet: {
                                uri: '/gdc/md/project/333'
                            },
                            from: '2016-01-01',
                            to: '2017-01-01'
                        }
                    }, {
                        positiveAttributeFilter: {
                            displayForm: {
                                uri: '/gdc/md/project/obj/1'
                            },
                            in: [
                                `${'/gdc/md/project/obj/11'}?id=1`,
                                `${'/gdc/md/project/obj/11'}?id=2`
                            ]
                        }
                    }
                ]
            }
        }
    }
};

export const factBasedMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/fact.id'
                },
                aggregation: 'sum'
            }
        }
    }
};

export const factBasedRenamedMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Summary',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/fact.id'
                },
                aggregation: 'sum'
            }
        }
    }
};

export const attributeBasedMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        format: '$#,##0.00',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/1'
                },
                aggregation: 'count'
            }
        }
    }
};

export const attributeBasedMeasureWithoutFormat: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/1'
                },
                aggregation: 'count'
            }
        }
    }
};

export const attributeBasedRenamedMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Count',
        format: '$#,##0.00',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/1'
                },
                aggregation: 'count'
            }
        }
    }
};

export const showInPercent: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        format: '$#,##0.00',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                },
                computeRatio: true
            }
        }
    }
};

export const showInPercentWithoutFormat: IMeasure = {
    measure: {
        localIdentifier: 'm1',
        alias: 'Measure M1',
        definition: {
            measureDefinition: {
                item: {
                    uri: '/gdc/md/project/obj/metric.id'
                },
                computeRatio: true
            }
        }
    }
};

export const popMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1_pop',
        alias: 'Measure M1 - SP year ago',
        definition: {
            popMeasureDefinition: {
                measureIdentifier: 'm1',
                popAttribute: {
                    uri: '/gdc/md/project/obj/11'
                }
            }
        }
    }
};

export const previousPeriodMeasure: IMeasure = {
    measure: {
        localIdentifier: 'm1_pop',
        alias: 'Measure M1 - previous period',
        definition: {
            previousPeriodMeasure: {
                measureIdentifier: 'm1',
                dateDataSets: [{
                    dataSet: {
                        uri: '/gdc/md/project/obj/1'
                    },
                    periodsAgo: 1
                }, {
                    dataSet: {
                        uri: '/gdc/md/project/obj/1'
                    },
                    periodsAgo: 2
                }]
            }
        }
    }
};

export const arithmeticMeasure: IMeasure = {
    measure: {
        localIdentifier: 'arithmetic_measure_1',
        alias: 'Sum of m1 and m2',
        definition: {
            arithmeticMeasure: {
                measureIdentifiers: ['m1', 'm2'],
                operator: 'sum'
            }
        }
    }
};
