import { Afm, Transformation } from '@gooddata/data-layer';

interface IFixture {
    afm: Afm.IAfm;
    transformation: Transformation.ITransformation;
}

export const empty: IFixture = {
    afm: {},

    transformation: {}
};

export const ATTRIBUTE_DISPLAY_FORM_URI = '/gdc/md/project/obj/1';
export const ATTRIBUTE_URI = '/gdc/md/project/obj/11';
export const ATTRIBUTE_DISPLAY_FORM_URI_2 = '/gdc/md/project/obj/2';
export const ATTRIBUTE_URI_2 = '/gdc/md/project/obj/22';
export const DATE_DISPLAY_FORM_URI = '/gdc/md/project/obj/3';
export const DATE_URI = '/gdc/md/project/33';
export const DATE_DATA_SET_URI = '/gdc/md/project/333';

export const simpleMeasure: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    }
                }
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'Measure M1'
            }
        ]
    }
};

export const filteredMeasure: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    },
                    filters: [
                        {
                            id: ATTRIBUTE_DISPLAY_FORM_URI,
                            in: [
                                '1', '2'
                            ]
                        }
                    ]
                }
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'Measure M1'
            }
        ]
    }
};

export const popMeasure: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    }
                }
            },
            {
                id: 'm1_pop',
                definition: {
                    baseObject: {
                        lookupId: 'm1'
                    },
                    popAttribute: {
                        id: ATTRIBUTE_DISPLAY_FORM_URI
                    }
                }
            }
        ],
        attributes: [
            {
                id: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'date'
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'Measure M1'
            },
            {
                id: 'm1_pop',
                title: 'Measure M1 - previous year'
            }
        ],

        sorting: [
            { column: 'm1', direction: 'desc' }
        ]
    }
};

export const popMeasureWithSorting: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    }
                }
            },
            {
                id: 'm1_pop',
                definition: {
                    baseObject: {
                        lookupId: 'm1'
                    },
                    popAttribute: {
                        id: ATTRIBUTE_DISPLAY_FORM_URI
                    }
                }
            }
        ],
        attributes: [
            {
                id: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'date'
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'Measure M1'
            },
            {
                id: 'm1_pop',
                title: 'Measure M1 - previous year'
            }
        ],

        sorting: [
            {
                column: 'm1_pop',
                direction: 'desc'
            }
        ]
    }
};

export const showInPercent: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    },
                    showInPercent: true
                }
            }
        ],

        attributes: [
            {
                id: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'attribute'
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'Measure M1'
            }
        ]
    }
};

export const showInPercentWithDate: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    },
                    showInPercent: true
                }
            }
        ],

        attributes: [
            {
                id: DATE_DISPLAY_FORM_URI,
                type: 'date'
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'Measure M1'
            }
        ]
    }
};

export const measureWithSorting: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    }
                }
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'Measure M1'
            }
        ],
        sorting: [
            { column: 'm1', direction: 'desc' }
        ]
    }
};

export const categoryWithSorting: IFixture = {
    afm: {
        attributes: [
            {
                id: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'attribute'
            }
        ]
    },

    transformation: {
        sorting: [
            {
                column: ATTRIBUTE_DISPLAY_FORM_URI,
                direction: 'desc'
            }
        ]
    }
};

export const factBasedMeasure: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: '/gdc/md/project/obj/fact.id'
                    },
                    aggregation: 'sum'
                }
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'SUM of Measure M1'
            }
        ]
    }
};

export const attributeBasedMeasure: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: ATTRIBUTE_DISPLAY_FORM_URI
                    },
                    aggregation: 'count'
                }
            }
        ]
    },

    transformation: {
        measures: [
            {
                id: 'm1',
                title: 'COUNT of Measure M1'
            }
        ]
    }
};

export const stackingAttribute: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    aggregation: 'sum',
                    baseObject: {
                        id: '/gdc/md/project/obj/metric.id'
                    }
                }
            }
        ],
        attributes: [
            {
                id: DATE_DISPLAY_FORM_URI,
                type: 'date'
            },
            {
                id: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'attribute'
            }
        ],
        filters: [
            {
                id: DATE_DATA_SET_URI,
                between: [-3, 0],
                granularity: 'quarter',
                type: 'date'
            },
            {
                id: ATTRIBUTE_DISPLAY_FORM_URI,
                type: 'attribute',
                notIn: []
            }
        ]
    },

    transformation: {
        measures: [
            { id: 'm1', title: 'Sum of Bundle cost', format: '#,##0.00' }
        ],
        buckets: [
            {
                name: 'stacks',
                attributes: [
                    {
                        id: ATTRIBUTE_DISPLAY_FORM_URI
                    }
                ]
            }
        ]
    }
};

export const attributeFilter: IFixture = {
    afm: {
        filters: [{
            id: ATTRIBUTE_DISPLAY_FORM_URI,
            type: 'attribute',
            in: [
                '1', '2', '3'
            ]
        }, {
            id: ATTRIBUTE_DISPLAY_FORM_URI_2,
            type: 'attribute',
            in: []
        }]
    },
    transformation: {}
};

export const dateFilter: IFixture = {
    afm: {
        filters: [{
            id: DATE_DATA_SET_URI,
            type: 'date',
            between: [-89, 0],
            granularity: 'date'
        }]
    },
    transformation: {}
};

export const attributeWithIdentifier: IFixture = {
    afm: {
        measures: [
            {
                id: 'm1',
                definition: {
                    baseObject: {
                        id: 'foo'
                    }
                }
            }
        ],
        attributes: [
            {
                id: 'bar',
                type: 'attribute'
            }
        ]
    },

    transformation: {}
};
