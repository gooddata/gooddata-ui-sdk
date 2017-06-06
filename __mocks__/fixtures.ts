export const charts = [
    {
        visualization: {
            content: {
                type: 'column',
                buckets: {
                    measures: [
                        {
                            measure: {
                                type: 'metric',
                                objectUri: '/gdc/md/myproject/obj/3276',
                                title: '# Logged-in Users',
                                measureFilters: [

                                ],
                                showInPercent: false,
                                showPoP: false
                            }
                        },
                        {
                            measure: {
                                type: 'metric',
                                objectUri: '/gdc/md/myproject/obj/1995',
                                title: '# Users Opened AD',
                                measureFilters: [

                                ],
                                showInPercent: false,
                                showPoP: false
                            }
                        }
                    ],
                    categories: [
                        {
                            category: {
                                type: 'date',
                                collection: 'view',
                                displayForm: '/gdc/md/myproject/obj/851',
                                attribute: '/gdc/md/myproject/obj/914'
                            }
                        }
                    ],
                    filters: [
                        {
                            dateFilter: {
                                type: 'relative',
                                from: -3,
                                to: 0,
                                granularity: 'GDC.time.quarter',
                                dataset: '/gdc/md/myproject/obj/921',
                                attribute: '/gdc/md/myproject/obj/914'
                            }
                        }
                    ]
                }
            },
            meta: {
                isProduction: 1,
                summary: '',
                created: '2017-05-23 09:24:41',
                identifier: 'aagAVA3ffizU',
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/1',
                deprecated: '0',
                title: 'Measure over time',
                tags: '',
                contributor: '/gdc/account/profile/johndoe',
                category: 'visualization'
            }
        }
    }, {
        visualization: {
            content: {
                buckets: {
                    measures: [
                        {
                            measure: {
                                measureFilters: [

                                ],
                                showPoP: false,
                                showInPercent: false,
                                type: 'metric',
                                title: '# Accounts with AD Query',
                                objectUri: '/gdc/md/myproject/obj/8172'
                            }
                        }
                    ],
                    categories: [
                        {
                            category: {
                                attribute: '/gdc/md/myproject/obj/914',
                                sort: 'asc',
                                type: 'date',
                                collection: 'attribute',
                                displayForm: '/gdc/md/myproject/obj/851'
                            }
                        }
                    ],
                    filters: [
                        {
                            dateFilter: {
                                attribute: '/gdc/md/myproject/obj/914',
                                to: 0,
                                granularity: 'GDC.time.quarter',
                                from: -3,
                                dataset: '/gdc/md/myproject/obj/921',
                                type: 'relative'
                            }
                        }
                    ]
                },
                type: 'table'
            },
            meta: {
                author: '/gdc/account/profile/johndoe',
                uri: '/gdc/md/myproject/obj/2',
                tags: '',
                created: '2017-05-23 09:24:41',
                identifier: 'aa5CD0OcfSpg',
                deprecated: '0',
                summary: '',
                isProduction: 1,
                title: 'Measure over time (table)',
                category: 'visualization',
                contributor: '/gdc/account/profile/johndoe'
            }
        }
    }
];
