import { VisualizationObject } from '@gooddata/data-layer';
import { VisualizationTypes } from '../src/constants/visualizationTypes';

export const charts: [{ visualization: VisualizationObject.IVisualizationObject }] = [
    {
        visualization: {
            content: {
                type: VisualizationTypes.COLUMN,
                buckets: {
                    measures: [
                        {
                            measure: {
                                type: 'metric',
                                objectUri: '/gdc/md/myproject/obj/3276',
                                title: '# Logged-in Users',
                                measureFilters: [],
                                showInPercent: false,
                                showPoP: false
                            }
                        },
                        {
                            measure: {
                                type: 'metric',
                                objectUri: '/gdc/md/myproject/obj/1995',
                                title: '# Users Opened AD',
                                measureFilters: [],
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
                type: VisualizationTypes.TABLE
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
                category: 'visualization',
                contributor: '/gdc/account/profile/johndoe'
            }
        }
    }
];
