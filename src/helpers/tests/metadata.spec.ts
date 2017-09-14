import { VisualizationObject } from '@gooddata/data-layer';
import { ISorting, updateSorting } from '../metadata';
import { VisualizationTypes } from '../../constants/visualizationTypes';

describe('updateSorting', () => {
    let metadata: VisualizationObject.IVisualizationObject;

    const MEASURE_M1: VisualizationObject.IMeasure = {
        measure: {
            type: 'metric',
            objectUri: '/gdc/md/project-id/obj/object-id',
            showInPercent: false,
            showPoP: false,
            title: 'Measure M1',
            measureFilters: [],
            generatedId: 'm1'
        }
    };

    const MEASURE_M1_SORTED_ASC: VisualizationObject.IMeasure = {
        measure: {
            type: 'metric',
            objectUri: '/gdc/md/project-id/obj/object-id-sorted-asc',
            showInPercent: false,
            showPoP: false,
            title: 'Measure M1 sorted ASC',
            measureFilters: [],
            generatedId: 'm1-sorted-asc',
            sort: {
                direction: 'asc'
            }
        }
    };

    const MEASURE_WITH_POP: VisualizationObject.IMeasure = {
        measure: {
            type: 'metric',
            objectUri: '/gdc/md/project-id/obj/object-id-pop',
            showInPercent: false,
            showPoP: true,
            title: 'Measure with PoP',
            measureFilters: [],
            generatedId: 'm1_pop'
        }
    };

    const CATEGORY_1: VisualizationObject.ICategory = {
        category: {
            type: 'attribute',
            collection: 'attribute',
            displayForm: 'df1',
            sort: 'asc'
        }
    };

    const CATEGORY_2: VisualizationObject.ICategory = {
        category: {
            type: 'attribute',
            collection: 'attribute',
            displayForm: 'df2'
        }
    };

    beforeEach(() => metadata = {
        content: {
            type: VisualizationTypes.BAR,
            buckets: {
                measures: [],
                categories: [],
                filters: []
            }
        },
        meta: {
            title: 'Title'
        }
    });

    it('should update sort info on metric', () => {
        metadata.content.buckets.measures = [
            MEASURE_M1
        ];

        metadata.content.buckets.categories = [
            CATEGORY_1,
            CATEGORY_2
        ];

        const sortingInfo: ISorting = {
            sorting: {
                column: 'm1',
                direction: 'asc'
            },
            change: {
                id: 'm1',
                title: '',
                type: 'metric',
                uri: '/uri/'
            }
        };

        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                updatedMetadata: {
                    content: {
                        buckets: {
                            categories: [
                                {
                                    category: {
                                        collection: 'attribute',
                                        displayForm: 'df1',
                                        sort: null,
                                        type: 'attribute'
                                    }
                                },
                                {
                                    category: {
                                        collection: 'attribute',
                                        displayForm: 'df2',
                                        sort: null,
                                        type: 'attribute'
                                    }
                                }
                            ],
                            filters: [],
                            measures: [
                                {
                                    measure: {
                                        generatedId: 'm1',
                                        measureFilters: [],
                                        objectUri: '/gdc/md/project-id/obj/object-id',
                                        showInPercent: false,
                                        showPoP: false,
                                        sort: { direction: 'asc' },
                                        title: 'Measure M1',
                                        type: 'metric'
                                    }
                                }
                            ]
                        },
                        type: VisualizationTypes.BAR,
                    },
                    meta: {
                        title: 'Title'
                    }
                },
                updatedSorting: {
                    sorting: {
                        column: 'm1',
                        direction: 'asc'
                    },
                    change: {
                        id: 'm1',
                        title: '',
                        type: 'metric',
                        uri: '/uri/'
                    }
                }
            });
    });

    it('should update sort info on PoP metric', () => {
        metadata.content.buckets.measures = [
            MEASURE_WITH_POP,
            MEASURE_M1
        ];

        metadata.content.buckets.categories = [
            CATEGORY_1,
            CATEGORY_2
        ];

        const sortingInfo = {
            sorting: {
                column: 'm1_pop',
                direction: 'desc'
            },
            change: {
                id: 'm1',
                title: '',
                type: 'metric',
                uri: '/uri/'
            }
        };

        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                updatedMetadata: {
                    content: {
                        buckets: {
                            categories: [
                                {
                                    category: {
                                        collection: 'attribute',
                                        displayForm: 'df1',
                                        sort: null,
                                        type: 'attribute'
                                    }
                                },
                                {
                                    category: {
                                        collection: 'attribute',
                                        displayForm: 'df2',
                                        sort: null,
                                        type: 'attribute'
                                    }
                                }
                            ],
                            filters: [],
                            measures: [
                                {
                                    measure: {
                                        generatedId: 'm1_pop',
                                        measureFilters: [],
                                        objectUri: '/gdc/md/project-id/obj/object-id-pop',
                                        showInPercent: false,
                                        showPoP: true,
                                        sort: null,
                                        title: 'Measure with PoP',
                                        type: 'metric'
                                    }
                                },
                                {
                                    measure: {
                                        generatedId: 'm1',
                                        measureFilters: [],
                                        objectUri: '/gdc/md/project-id/obj/object-id',
                                        showInPercent: false,
                                        showPoP: false,
                                        sort: {
                                            direction: 'desc',
                                            sortByPoP: true
                                        },
                                        title: 'Measure M1',
                                        type: 'metric'
                                    }
                                }
                            ]
                        },
                        type: VisualizationTypes.BAR,
                    },
                    meta: {
                        title: 'Title'
                    }
                },
                updatedSorting: {
                    change: {
                        id: 'm1',
                        title: '',
                        type: 'metric',
                        uri: '/uri/',
                    },
                    sorting: {
                        column: 'm1_pop',
                        direction: 'desc',
                    }
                }
            });
    });

    it('should update sort info on category', () => {
        metadata.content.buckets.measures = [
            MEASURE_M1_SORTED_ASC
        ];

        metadata.content.buckets.categories = [
            CATEGORY_1,
            CATEGORY_2
        ];

        const sortingInfo = {
            sorting: {
                column: 'df2',
                direction: 'asc'
            },
            change: {
                id: 'm1',
                title: '',
                type: 'attrLabel',
                uri: '/uri/'
            }
        };

        expect(
            updateSorting(metadata, sortingInfo)).toEqual(
            {
                updatedMetadata: {
                    content: {
                        buckets: {
                            categories: [
                                {
                                    category: {
                                        collection: 'attribute',
                                        displayForm: 'df1',
                                        sort: null,
                                        type: 'attribute'
                                    }
                                },
                                {
                                    category: {
                                        collection: 'attribute',
                                        displayForm: 'df2',
                                        sort: 'asc',
                                        type: 'attribute'
                                    }
                                }
                            ],
                            filters: [],
                            measures: [
                                {
                                    measure: {
                                        generatedId: 'm1-sorted-asc',
                                        measureFilters: [],
                                        objectUri: '/gdc/md/project-id/obj/object-id-sorted-asc',
                                        showInPercent: false,
                                        showPoP: false,
                                        sort: null,
                                        title: 'Measure M1 sorted ASC',
                                        type: 'metric'
                                    }
                                }
                            ]
                        },
                        type: VisualizationTypes.BAR,
                    },
                    meta: {
                        title: 'Title'
                    }
                },
                updatedSorting: {
                    sorting: {
                        column: 'df2',
                        direction: 'asc'
                    },
                    change: {
                        id: 'm1',
                        title: '',
                        type: 'attrLabel',
                        uri: '/uri/'
                    }
                }
            });
    });
});
