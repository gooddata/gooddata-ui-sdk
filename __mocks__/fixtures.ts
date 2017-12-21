import { VisualizationObject, VisualizationClass } from '@gooddata/typings';

export const charts: [{ visualizationObject: VisualizationObject.IVisualizationObject }] = [
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
                ]
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
                title: 'PoP',
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
