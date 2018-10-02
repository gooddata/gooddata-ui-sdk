// (C) 2007-2018 GoodData Corporation
import { VisualizationObject, VisualizationClass } from '@gooddata/typings';

export const visualizationObjects: [{ visualizationObject: VisualizationObject.IVisualizationObject }] = [
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: '/gdc/md/myproject/obj/column'
                },
                buckets: [
                    {
                        localIdentifier: 'measures',
                        items: [
                            {
                                measure: {
                                    localIdentifier: 'm1',
                                    title: '# Logged-in Users',
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: '/gdc/md/myproject/obj/3276'
                                            },
                                            filters: []
                                        }
                                    }
                                }
                            },
                            {
                                measure: {
                                    localIdentifier: 'm2',
                                    title: '# Users Opened AD',
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: '/gdc/md/myproject/obj/1995'
                                            },
                                            filters: []
                                        }
                                    }
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
                                        uri: '/gdc/md/myproject/obj/851'
                                    }
                                }
                            }
                        ]
                    }
                ],
                filters: [
                    {
                        relativeDateFilter: {
                            from: -3,
                            to: 0,
                            granularity: 'GDC.time.quarter',
                            dataSet: {
                                uri: '/gdc/md/myproject/obj/921'
                            }
                        }
                    }
                ],
                properties:  JSON.stringify({
                    controls: {
                        grid: {
                            enabled: true
                        }
                    }
                })

            },
            meta: {
                isProduction: true,
                summary: '',
                created: new Date('2015-05-23T09:24:41Z'),
                identifier: 'aagAVA3ffizU',
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/1',
                deprecated: false,
                title: 'Measure over time',
                tags: '',
                contributor: '/gdc/account/profile/johndoe',
                category: 'visualizationObject'
            }
        }
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: '/gdc/md/myproject/obj/table'
                },
                buckets: [
                    {
                        localIdentifier: 'measures',
                        items: [
                            {
                                measure: {
                                    localIdentifier: 'm1',
                                    title: '# Accounts with AD Query',
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: '/gdc/md/myproject/obj/8172'
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        localIdentifier: 'attribute',
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: 'a1',
                                    displayForm: {
                                        uri: '/gdc/md/myproject/obj/851'
                                    }
                                }
                            }
                        ],
                        totals: [
                            {
                                measureIdentifier: 'm1',
                                type: 'avg',
                                alias: 'average',
                                attributeIdentifier: 'a1'
                            }
                        ]
                    }
                ],
                filters: [
                    {
                        relativeDateFilter: {
                            to: 0,
                            from: -3,
                            granularity: 'GDC.time.quarter',
                            dataSet: {
                                uri: '/gdc/md/myproject/obj/921'
                            }
                        }
                    }
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: 'asc',
                                attributeIdentifier: 'a1'
                            }
                        }
                    ]
                })
            },
            meta: {
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/2',
                tags: '',
                created: new Date('2015-05-23T09:24:41Z'),
                identifier: 'aa5CD0OcfSpg',
                deprecated: false,
                summary: '',
                isProduction: true,
                title: 'Measure over time (table)',
                category: 'visualizationObject',
                contributor: '/gdc/account/profile/johndoe'
            }
        }
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: '/gdc/md/myproject/obj/column'
                },
                buckets: [
                    {
                        localIdentifier: 'measures',
                        items: [
                            {
                                measure: {
                                    localIdentifier: 'm1',
                                    title: '# Logged-in Users',
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: '/gdc/md/myproject/obj/3276'
                                            },
                                            filters: []
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ],
                filters: []
            },
            meta: {
                isProduction: true,
                summary: '',
                created: new Date('2015-05-23T09:24:41Z'),
                identifier: 'aagAVA3ffizU',
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/onemeasure',
                deprecated: false,
                title: 'One measure',
                tags: '',
                contributor: '/gdc/account/profile/johndoe',
                category: 'visualizationObject'
            }
        }
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: '/gdc/md/myproject/obj/column'
                },
                buckets: [
                    {
                        localIdentifier: 'attribute',
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: 'a1',
                                    displayForm: {
                                        uri: '/gdc/md/myproject/obj/4001'
                                    }
                                }
                            }
                        ]
                    }
                ],
                filters: []
            },
            meta: {
                isProduction: true,
                summary: '',
                created: new Date('2015-05-23T09:24:41Z'),
                identifier: 'aagAVA3ffizU',
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/oneattribute',
                deprecated: false,
                title: 'One attribute',
                tags: '',
                contributor: '/gdc/account/profile/johndoe',
                category: 'visualizationObject'
            }
        }
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: '/gdc/md/myproject/obj/table'
                },
                buckets: [
                    {
                        localIdentifier: 'measures',
                        items: [
                            {
                                measure: {
                                    localIdentifier: 'm1',
                                    title: '# Accounts with AD Query',
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: '/gdc/md/myproject/obj/8172'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                measure: {
                                    localIdentifier: 'm1_pop',
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: 'm1',
                                            popAttribute: {
                                                uri: '/gdc/md/myproject/obj/1514'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                measure: {
                                    localIdentifier: 'm1_previous_period',
                                    definition: {
                                        previousPeriodMeasure: {
                                            measureIdentifier: 'm1',
                                            dateDataSets: [{
                                                dataSet: {
                                                    uri: '/gdc/md/myproject/obj/921'
                                                },
                                                periodsAgo: 1
                                            }]
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        localIdentifier: 'attribute',
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: 'a1',
                                    displayForm: {
                                        uri: '/gdc/md/myproject/obj/1515'
                                    }
                                }
                            }
                        ]
                    }
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: 'asc',
                                attributeIdentifier: 'a1'
                            }
                        }
                    ]
                })
            },
            meta: {
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/2',
                tags: '',
                created: new Date('2015-05-23T09:24:41Z'),
                identifier: 'aa5CD0OcfSpg',
                deprecated: false,
                summary: '',
                isProduction: true,
                title: 'Over time comparison',
                category: 'visualizationObject',
                contributor: '/gdc/account/profile/johndoe'
            }
        }
    },
    {
        visualizationObject: {
            content: {
                buckets: [{
                    localIdentifier: 'measures',
                    items: [{
                        measure: {
                            localIdentifier: 'fdd41e4ca6224cd2b5ecce15fdabf062',
                            format: '#,##0.00',
                            title: 'Sum of Email Clicks',
                            definition: {
                                measureDefinition: {
                                    aggregation: 'sum',
                                    item: {
                                        uri: '/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15428'
                                    }
                                }
                            }
                        }
                    }]
                }, {
                    localIdentifier: 'secondary_measures',
                    items: [{
                        measure: {
                            localIdentifier: 'fdd41e4ca6224cd2b5ecce15fdabf062_pop',
                            definition: {
                                popMeasureDefinition: {
                                    measureIdentifier: 'fdd41e4ca6224cd2b5ecce15fdabf062',
                                    popAttribute: {
                                        uri: '/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15330'
                                    }
                                }
                            }
                        }
                    }, {
                        measure: {
                            localIdentifier: 'fdd41e4ca6224cd2b5ecce15fdabf062_previous_period',
                            definition: {
                                previousPeriodMeasure: {
                                    measureIdentifier: 'fdd41e4ca6224cd2b5ecce15fdabf062',
                                    dateDataSets: [{
                                        dataSet: {
                                            uri: '/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/921'
                                        },
                                        periodsAgo: 1
                                    }]
                                }
                            }
                        }
                    }]
                }],
                filters: [{
                    absoluteDateFilter: {
                        to: '2017-12-31',
                        from: '2014-01-01',
                        dataSet: {
                            uri: '/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/15337'
                        }
                    }
                }],
                visualizationClass: {
                    uri: '/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/808936'
                }
            },
            meta: {
                author: '/gdc/account/profile/26728eacad349ba6c4c04c5e5cc59437',
                uri: '/gdc/md/yrungi0zwpoud7h1kmh6ldhp0vgkpi41/obj/809028',
                tags: '',
                created: new Date('2015-05-23T09:24:41Z'),
                identifier: 'aadQOoKTbq5E',
                deprecated: false,
                summary: '',
                isProduction: true,
                title: 'Headline over time comparison',
                category: 'visualizationObject',
                contributor: '/gdc/account/profile/26728eacad349ba6c4c04c5e5cc59437'
            }
        }
    },
    {
        visualizationObject: {
            content: {
                visualizationClass: {
                    uri: '/gdc/md/myproject/obj/table'
                },
                buckets: [
                    {
                        localIdentifier: 'measures',
                        items: [
                            {
                                measure: {
                                    localIdentifier: 'm1',
                                    title: '# Accounts with AD Query',
                                    alias: 'AD Queries',
                                    definition: {
                                        measureDefinition: {
                                            item: {
                                                uri: '/gdc/md/myproject/obj/8172'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                measure: {
                                    localIdentifier: 'm1_pop',
                                    definition: {
                                        popMeasureDefinition: {
                                            measureIdentifier: 'm1',
                                            popAttribute: {
                                                uri: '/gdc/md/myproject/obj/1514'
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                measure: {
                                    localIdentifier: 'm1_previous_period',
                                    definition: {
                                        previousPeriodMeasure: {
                                            measureIdentifier: 'm1',
                                            dateDataSets: [{
                                                dataSet: {
                                                    uri: '/gdc/md/myproject/obj/921'
                                                },
                                                periodsAgo: 1
                                            }]
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        localIdentifier: 'attribute',
                        items: [
                            {
                                visualizationAttribute: {
                                    localIdentifier: 'a1',
                                    displayForm: {
                                        uri: '/gdc/md/myproject/obj/1515'
                                    }
                                }
                            }
                        ]
                    }
                ],
                properties: JSON.stringify({
                    sortItems: [
                        {
                            attributeSortItem: {
                                direction: 'asc',
                                attributeIdentifier: 'a1'
                            }
                        }
                    ]
                })
            },
            meta: {
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/2',
                tags: '',
                created: new Date('2015-05-23T09:24:41Z'),
                identifier: 'aa5CD0OcfSpg',
                deprecated: false,
                summary: '',
                isProduction: true,
                title: 'Over time comparison alias',
                category: 'visualizationObject',
                contributor: '/gdc/account/profile/johndoe'
            }
        }
    }
];

export const visualizationClasses: [{ visualizationClass: VisualizationClass.IVisualizationClass }] = [
    {
        visualizationClass: {
            content: {
                url: 'local:column',
                icon: '',
                iconSelected: '',
                checksum: ''
            },
            meta: {
                title: 'Column chart',
                uri: '/gdc/md/myproject/obj/column'
            }
        }
    },
    {
        visualizationClass: {
            content: {
                url: 'local:table',
                icon: '',
                iconSelected: '',
                checksum: ''
            },
            meta: {
                title: 'Table chart',
                uri: '/gdc/md/myproject/obj/table'
            }
        }
    }
];
