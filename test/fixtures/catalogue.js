export const optionsForEmptySelection = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: []
    }
};

export const requestForEmptySelection = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};

const attributesMapForMeasureTypeFactWithFilter = {
    '/gdc/md/FoodMartDemo/obj/124': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/58'
            }
        }
    }
};

export const optionsForMeasureTypeFactWithFilter = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'measures',
                items: [
                    {
                        measure: {
                            localIdentifier: 'm1',
                            definition:
                            {
                                measureDefinition: {
                                    aggregation: 'sum',
                                    item: {
                                        uri: '/gdc/md/FoodMartDemo/obj/1'
                                    },
                                    filters: [
                                        {
                                            positiveAttributeFilter: {
                                                displayForm: {
                                                    uri: '/gdc/md/FoodMartDemo/obj/124'
                                                },
                                                in: [
                                                    '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            title: 'Sum of Accounting Amount',
                            format: '#,##0.00'
                        }
                    }
                ]
            }
        ]
    },
    attributesMap: attributesMapForMeasureTypeFactWithFilter
};

export const requestForMeasureTypeFactWithFilter = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [
            'SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])'
        ],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};

const attributesMapForMeasureWithFilterAndCategory = {
    '/gdc/md/FoodMartDemo/obj/124': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/58'
            }
        }
    },
    '/gdc/md/FoodMartDemo/obj/117': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/54'
            }
        }
    }
};
export const optionsForMeasureWithFilterAndCategory = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: [{
            localIdentifier: 'measures',
            items: [
                {
                    measure: {
                        localIdentifier: 'm1',
                        definition: {
                            measureDefinition: {
                                item: {
                                    uri: '/gdc/md/FoodMartDemo/obj/1'
                                },
                                aggregation: 'sum',
                                filters: [
                                    {
                                        positiveAttributeFilter: {
                                            displayForm: {
                                                uri: '/gdc/md/FoodMartDemo/obj/124'
                                            },
                                            in: [
                                                '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        title: 'Sum of Accounting Amount',
                        format: '#,##0.00'
                    }
                }
            ]
        },
        {
            localIdentifier: 'view',
            items: [
                {
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: '/gdc/md/FoodMartDemo/obj/117'
                        }
                    }
                }
            ]
        }]
    },
    attributesMap: attributesMapForMeasureWithFilterAndCategory
};


export const requestForMeasureWithFilterAndCategory = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [
            '/gdc/md/FoodMartDemo/obj/54',
            'SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])'
        ],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};


const attributesMapForMeasureWithFilterAndCategoryShowInPercent = {
    '/gdc/md/FoodMartDemo/obj/124': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/58'
            }
        }
    },
    '/gdc/md/FoodMartDemo/obj/117': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/54'
            }
        }
    }
};
export const optionsForMeasureWithFilterAndCategoryShowInPercent = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'measures',
                items: [
                    {
                        measure: {
                            localIdentifier: 'm1',
                            definition: {
                                measureDefinition: {
                                    aggregation: 'sum',
                                    item: {
                                        uri: '/gdc/md/FoodMartDemo/obj/1'
                                    },
                                    filters: [
                                        {
                                            positiveAttributeFilter: {
                                                displayForm: {
                                                    uri: '/gdc/md/FoodMartDemo/obj/124'
                                                },
                                                in: [
                                                    '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                                ]
                                            }
                                        }
                                    ],
                                    computeRatio: true
                                }
                            },
                            title: 'Sum of Accounting Amount',
                            format: '#,##0.00'
                        }
                    }
                ]
            },
            {
                localIdentifier: 'view',
                items: [
                    {
                        visualizationAttribute: {
                            localIdentifier: 'a1',
                            displayForm: {
                                uri: '/gdc/md/FoodMartDemo/obj/117'
                            }
                        }
                    }
                ]
            }
        ]
    },
    attributesMap: attributesMapForMeasureWithFilterAndCategoryShowInPercent
};

export const requestForMeasureWithFilterAndCategoryShowInPercent = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [
            '/gdc/md/FoodMartDemo/obj/54',
            'SELECT (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])) / (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) BY ALL [/gdc/md/FoodMartDemo/obj/54] WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000]))'
        ],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};

export const optionsForMeasureWithNotInFilterAndCategoryShowInPercent = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'measures',
                items: [
                    {
                        measure: {
                            localIdentifier: 'm1',
                            definition: {
                                measureDefinition: {
                                    aggregation: 'sum',
                                    item: {
                                        uri: '/gdc/md/FoodMartDemo/obj/1'
                                    },
                                    filters: [
                                        {
                                            negativeAttributeFilter: {
                                                displayForm: {
                                                    uri: '/gdc/md/FoodMartDemo/obj/124'
                                                },
                                                notIn: [
                                                    '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                                ]
                                            }
                                        }
                                    ],
                                    computeRatio: true
                                }
                            },
                            title: 'Sum of Accounting Amount',
                            format: '#,##0.00'
                        }
                    }
                ]
            },
            {
                localIdentifier: 'view',
                items: [
                    {
                        visualizationAttribute: {
                            localIdentifier: 'a1',
                            displayForm: {
                                uri: '/gdc/md/FoodMartDemo/obj/117'
                            }
                        }
                    }
                ]
            }
        ]
    },
    attributesMap: attributesMapForMeasureWithFilterAndCategoryShowInPercent
};

export const requestForMeasureWithNotInFilterAndCategoryShowInPercent = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [
            '/gdc/md/FoodMartDemo/obj/54',
            'SELECT (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] NOT IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])) / (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) BY ALL [/gdc/md/FoodMartDemo/obj/54] WHERE [/gdc/md/FoodMartDemo/obj/58] NOT IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000]))'
        ],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};

const attributesMapForMeasureWithShowInPercent = {
    '/gdc/md/FoodMartDemo/obj/124': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/58'
            }
        }
    },
    '/gdc/md/FoodMartDemo/obj/117': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/54'
            }
        }
    }
};
export const optionsForMeasureWithShowInPercent = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'measures',
                items: [
                    {
                        measure: {
                            definition: {
                                measureDefinition: {
                                    aggregation: 'sum',
                                    item: {
                                        uri: '/gdc/md/FoodMartDemo/obj/1'
                                    },
                                    filters: [
                                        {
                                            positiveAttributeFilter: {
                                                displayForm: {
                                                    uri: '/gdc/md/FoodMartDemo/obj/124'
                                                },
                                                in: [
                                                    '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                                ]
                                            }
                                        }
                                    ],
                                    computeRatio: true
                                }
                            },
                            title: '% Sum of Accounting Amount',
                            format: '#,##0.00'
                        }
                    }
                ]
            },
            {
                localIdentifier: 'view',
                items: [
                    {
                        visualizationAttribute: {
                            displayForm: {
                                uri: '/gdc/md/FoodMartDemo/obj/117'
                            }
                        }
                    }
                ]
            }
        ]
    },
    attributesMap: attributesMapForMeasureWithShowInPercent
};

export const requestForMeasureWithShowInPercent = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [
            '/gdc/md/FoodMartDemo/obj/54',
            'SELECT (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])) ' +
                '/ (SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) BY ALL [/gdc/md/FoodMartDemo/obj/54] WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000]))'
        ],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};

const attributesMapForTwoMeasuresFactAndAtrribute = {
    '/gdc/md/FoodMartDemo/obj/124': {
        attribute: {
            content: {},
            meta: {
                uri: '/gdc/md/FoodMartDemo/obj/58'
            }
        }
    }
};

export const optionsForTwoMeasuresFactAndAtrribute = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'measures',
                items: [
                    {
                        measure: {
                            localIdentifier: 'm1',
                            definition: {
                                measureDefinition: {
                                    aggregation: 'sum',
                                    item: {
                                        uri: '/gdc/md/FoodMartDemo/obj/1'
                                    },
                                    filters: [
                                        {
                                            positiveAttributeFilter: {
                                                displayForm: {
                                                    uri: '/gdc/md/FoodMartDemo/obj/124'
                                                },
                                                in: [
                                                    '/gdc/md/FoodMartDemo/obj/58/elements?id=1000'
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            title: 'Sum of Accounting Amount',
                            format: '#,##0.00'
                        }
                    },
                    {
                        measure: {
                            localIdentifier: 'm2',
                            definition: {
                                measureDefinition: {
                                    aggregation: 'count',
                                    item: {
                                        uri: '/gdc/md/FoodMartDemo/obj/40'
                                    }
                                }
                            },
                            title: 'Count of Brand',
                            format: '#,##0.00'
                        }
                    }
                ]
            }
        ]
    },
    attributesMap: attributesMapForTwoMeasuresFactAndAtrribute
};

export const requestForTwoMeasureFactAndAttribute = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [
            'SELECT SUM([/gdc/md/FoodMartDemo/obj/1]) WHERE [/gdc/md/FoodMartDemo/obj/58] IN ([/gdc/md/FoodMartDemo/obj/58/elements?id=1000])',
            'SELECT COUNT([/gdc/md/FoodMartDemo/obj/40])'
        ],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};

export const optionsForMetric = {
    types: [
        'metric',
        'attribute',
        'fact'
    ],
    paging: {
        offset: 0,
        limit: 100
    },
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'measures',
                items: [
                    {
                        measure: {
                            localIdentifier: 'm1',
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: '/gdc/md/FoodMartDemo/obj/8349'
                                    }
                                }
                            },
                            title: '+My metric',
                            format: '#,##0.00'
                        }
                    }
                ]
            }
        ]
    }
};

export const requestForMetric = {
    catalogRequest: {
        types: [
            'metric',
            'attribute',
            'fact'
        ],
        paging: {
            offset: 0,
            limit: 100
        },
        bucketItems: [
            '/gdc/md/FoodMartDemo/obj/8349'
        ],
        requiredDataSets: {
            type: 'PRODUCTION'
        }
    }
};

export const loadCatalogResponse = {
    paging: {
        count: 4,
        offset: 0
    },
    totals: {
        available: 4,
        unavailable: 0
    },
    catalog: [
        {
            metric: {
                content: {
                    format: '#,##0.00',
                    tree: {
                        content: [
                            {
                                content: [
                                    {
                                        value: 'SUM',
                                        content: [
                                            {
                                                value: '/gdc/md/FoodMartDemo/obj/4',
                                                position: {
                                                    column: 12,
                                                    line: 2
                                                },
                                                type: 'fact object'
                                            }
                                        ],
                                        position: {
                                            column: 8,
                                            line: 2
                                        },
                                        type: 'function'
                                    }
                                ],
                                position: {
                                    column: 8,
                                    line: 2
                                },
                                type: 'expression'
                            }
                        ],
                        position: {
                            column: 1,
                            line: 2
                        },
                        type: 'metric'
                    },
                    expression: 'SELECT SUM([/gdc/md/FoodMartDemo/obj/4])'
                },
                meta: {
                    author: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                    uri: '/gdc/md/FoodMartDemo/obj/8336',
                    tags: '',
                    created: '2016-04-26 15:49:49',
                    identifier: 'aaeEnkckePID',
                    deprecated: '0',
                    summary: '',
                    isProduction: 1,
                    unlisted: 1,
                    title: '!!!!!!!!!!!Sale Units [Sum]',
                    category: 'metric',
                    updated: '2016-04-26 15:50:03',
                    contributor: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                }
            }
        },
        {
            fact: {
                content: {
                    expr: [
                        {
                            data: '/gdc/md/FoodMartDemo/obj/3450',
                            type: 'col'
                        }
                    ]
                },
                meta: {
                    author: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                    uri: '/gdc/md/FoodMartDemo/obj/1',
                    tags: 'accounting amount',
                    created: '2008-06-27 11: 10: 22',
                    identifier: 'aiUoIYHjgESv',
                    deprecated: '0',
                    summary: 'Accounting Amount',
                    isProduction: 1,
                    title: 'Accounting Amount',
                    category: 'fact',
                    updated: '2009-10-08 23:05: 17',
                    contributor: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                }
            }
        },
        {
            attribute: {
                content: {
                    drillDownStepAttributeDF: '/gdc/md/FoodMartDemo/obj/105',
                    pk: [
                        {
                            data: '/gdc/md/FoodMartDemo/obj/3256',
                            type: 'col'
                        }
                    ],
                    dimension: '/gdc/md/FoodMartDemo/obj/20',
                    displayForms: [
                        {
                            content: {
                                formOf: '/gdc/md/FoodMartDemo/obj/69',
                                expression: '[/gdc/md/FoodMartDemo/obj/3410]'
                            },
                            links: {
                                elements: '/gdc/md/FoodMartDemo/obj/137/elements'
                            },
                            meta: {
                                author: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                                uri: '/gdc/md/FoodMartDemo/obj/137',
                                tags: '',
                                created: '2008-06-27 11: 10: 26',
                                identifier: 'alboIYHjgESv',
                                deprecated: '0',
                                summary: '',
                                isProduction: 1,
                                title: 'Management Role',
                                category: 'attributeDisplayForm',
                                updated: '2009-10-08 22:37: 29',
                                contributor: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                            }
                        }
                    ],
                    fk: [
                        {
                            data: '/gdc/md/FoodMartDemo/obj/3257',
                            type: 'col'
                        }
                    ]
                },
                meta: {
                    author: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                    uri: '/gdc/md/FoodMartDemo/obj/69',
                    tags: 'employee hr management role',
                    created: '2008-06-27 11: 10: 25',
                    identifier: 'ahwoIYHjgESv',
                    deprecated: '0',
                    summary: 'Management Role',
                    isProduction: 1,
                    title: 'Management Role',
                    category: 'attribute',
                    updated: '2009-10-08 22:37: 29',
                    contributor: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                }
            }
        },
        {
            metric: {
                content: {
                    format: '#,##0.00',
                    tree: {
                        content: [
                            {
                                content: [
                                    {
                                        value: 'SUM',
                                        content: [
                                            {
                                                value: '/gdc/md/FoodMartDemo/obj/4',
                                                position: {
                                                    column: 12,
                                                    line: 2
                                                },
                                                type: 'fact object'
                                            }
                                        ],
                                        position: {
                                            column: 8,
                                            line: 2
                                        },
                                        type: 'function'
                                    }
                                ],
                                position: {
                                    column: 8,
                                    line: 2
                                },
                                type: 'expression'
                            }
                        ],
                        position: {
                            column: 1,
                            line: 2
                        },
                        type: 'metric'
                    },
                    expression: 'SELECT SUM([/gdc/md/FoodMartDemo/obj/4])'
                },
                meta: {
                    author: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff',
                    uri: '/gdc/md/FoodMartDemo/obj/8342',
                    tags: '',
                    created: '2016-04-27 16:57: 26',
                    identifier: 'aabKv6ZZgEoS',
                    deprecated: '0',
                    summary: '',
                    isProduction: 1,
                    unlisted: 1,
                    title: 'Sale Units [Sum]',
                    category: 'metric',
                    updated: '2016-04-27 16:57: 26',
                    contributor: '/gdc/account/profile/876ec68f5630b38de65852ed5d6236ff'
                }
            }
        }
    ]
};

// for #loadDateDataSets tests
export const loadDateDataSetsResponse = {
    dateDataSetsResponse: {
        unavailableDateDataSetsCount: 1,
        dateDataSets: [
            {
                relevance: 0,
                availableDateAttributes: [
                    {
                        attributeMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2003',
                            tags: 'date year',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.year',
                            summary: 'Year',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attribute',
                            updated: '2016-06-01 11:08:55',
                            title: 'Year (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        },
                        type: 'GDC.time.year',
                        defaultDisplayFormMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2005',
                            tags: '',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.aag81lMifn6q',
                            summary: 'DisplayForm Year.',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attributeDisplayForm',
                            updated: '2016-06-01 11:08:54',
                            title: 'Year (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        }
                    },
                    {
                        attributeMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2043',
                            tags: 'date eu week',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.euweek',
                            summary: 'Week/Year based on EU Weeks (Mon-Sun). By default, if a week spans multiple years or quarters (ie, end of the year/quarter), it is marked as first or last week of the period according to particular standards (ie, US or EU). Labels marked as \'Continuous\' show both weeks (W53/2009 - W1/2010).',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attribute',
                            updated: '2016-06-01 11:08:55',
                            title: 'Week (Mon-Sun)/Year (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        },
                        type: 'GDC.time.week',
                        defaultDisplayFormMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2053',
                            tags: '',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.aa281lMifn6q',
                            summary: 'DisplayForm Week #/Year (W1/2010).',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attributeDisplayForm',
                            updated: '2016-06-01 11:08:55',
                            title: 'Week #/Year (W1/2010) (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        }
                    },
                    {
                        attributeMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2129',
                            tags: 'date quarter',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.quarter',
                            summary: 'Quarter and Year (Q1/2010)',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attribute',
                            updated: '2016-06-01 11:08:55',
                            title: 'Quarter/Year (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        },
                        type: 'GDC.time.quarter',
                        defaultDisplayFormMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2131',
                            tags: '',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.aci81lMifn6q',
                            summary: 'DisplayForm US Short.',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attributeDisplayForm',
                            updated: '2016-06-01 11:08:55',
                            title: 'US Short (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        }
                    },
                    {
                        attributeMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2140',
                            tags: 'date month',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.month',
                            summary: 'Month and Year',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attribute',
                            updated: '2016-06-01 11:08:55',
                            title: 'Month/Year (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        },
                        type: 'GDC.time.month',
                        defaultDisplayFormMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2142',
                            tags: '',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.act81lMifn6q',
                            summary: 'DisplayForm Short (Jan 2010).',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attributeDisplayForm',
                            updated: '2016-06-01 11:08:55',
                            title: 'Short (Jan 2010) (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        }
                    },
                    {
                        attributeMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2167',
                            tags: 'date',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.date',
                            summary: 'Date',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attribute',
                            updated: '2016-06-01 11:08:56',
                            title: 'Date (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        },
                        type: 'GDC.time.date',
                        defaultDisplayFormMeta: {
                            locked: 0,
                            author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                            uri: '/gdc/md/FoodMartDemo/obj/2173',
                            tags: '',
                            created: '2010-08-02 08:13:42',
                            deprecated: '0',
                            identifier: 'paydate.date.mmddyyyy',
                            summary: 'DisplayForm mm/dd/yyyy.',
                            isProduction: 0,
                            unlisted: 0,
                            category: 'attributeDisplayForm',
                            updated: '2016-06-01 11:08:55',
                            title: 'mm/dd/yyyy (Paydate)',
                            contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                        }
                    }
                ],
                meta: {
                    locked: 0,
                    author: '/gdc/account/profile/2901168e72fbedfead70f65da539c160',
                    uri: '/gdc/md/FoodMartDemo/obj/2180',
                    tags: '',
                    created: '2010-08-02 08:13:42',
                    deprecated: '0',
                    identifier: 'paydate.dataset.dt',
                    summary: 'DataSet Date',
                    isProduction: 0,
                    unlisted: 0,
                    category: 'dataSet',
                    updated: '2016-06-01 11:08:55',
                    title: 'Date (Paydate)',
                    contributor: '/gdc/account/profile/2901168e72fbedfead70f65da539c160'
                }
            }
        ]
    }
};

export const optionsForOnlyDateBuckets = {
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'attribute',
                items: [{
                    visualizationAttribute: {
                        localIdentifier: 'a1',
                        displayForm: {
                            uri: '/gdc/md/FoodMartDemo/obj/attr1'
                        }
                    }
                }]
            }
        ],
        filters: [{
            relativeDateFilter: {
                dataSet: {
                    uri: '/attr1'
                },
                granularity: 'GDC.time.year',
                from: -1,
                to: -1
            }
        }]
    },
    attributesMap: {
        '/gdc/md/FoodMartDemo/obj/attr1': {
            attribute: {
                content: {
                    type: 'GDC.time.year'
                },
                meta: {
                    uri: '/gdc/md/qamfsd9cw85e53mcqs74k8a0mwbf5gc2/obj/1233'
                }
            }
        }
    }
};

export const optionsForPureMAQL = {
    bucketItems: {
        buckets: [
            {
                localIdentifier: 'measures',
                items: [
                    {
                        measure: {
                            localIdentifier: 'm1_pop',
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: 'm1',
                                    popAttribute: {
                                        uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2167'
                                    }
                                }
                            }
                        }
                    },
                    {
                        measure: {
                            localIdentifier: 'm1',
                            definition: {
                                measureDefinition: {
                                    item: {
                                        uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2276'
                                    },
                                    filters: [
                                        {
                                            negativeAttributeFilter: {
                                                displayForm: {
                                                    uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2267'
                                                },
                                                notIn: [
                                                    '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266/elements?id=706'
                                                ]
                                            }
                                        }
                                    ],
                                    computeRatio: true,
                                    aggregation: 'sum'
                                }
                            },
                            format: '#,##0.00',
                            title: 'Measure title'
                        }
                    }
                ]
            },
            {
                localIdentifier: 'trend',
                items: [
                    {
                        visualizationAttribute: {
                            localIdentifier: 'a1',
                            displayForm: {
                                uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2275'
                            }
                        }
                    }
                ]
            }
        ],
        filters: [
            {
                negativeAttributeFilter: {
                    displayForm: {
                        uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2275'
                    },
                    notIn: []
                }
            },
            {
                absoluteDateFilter: {
                    dataset: {
                        uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2180'
                    },
                    to: '2016-09-30',
                    from: '2000-07-01'
                }
            }
        ]
    },
    attributesMap: {
        '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2267': {
            attribute: {
                content: {},
                meta: {
                    uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2266'
                }
            }
        },
        '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2275': {
            attribute: {
                content: {},
                meta: {
                    uri: '/gdc/md/ovs4ke6eyaus033gyojhv1rh7u1bukmy/obj/2274'
                }
            }
        }
    }
};
