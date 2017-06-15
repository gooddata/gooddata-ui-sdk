import { updateSorting } from '../metadata';

describe('updateSorting', () => {
    let metadata;
    beforeEach(() => metadata = {
        content: {
            buckets: {
                measures: [],
                categories: []
            }
        }
    });
    it('should update sort info on metric', () => {
        metadata.content.buckets.measures = [{
            measure: {
                generatedId: 'm1'
            }
        }];
        metadata.content.buckets.categories = [{
            category: {
                sort: 'asc'
            }
        },
        {
            category: {}
        }];
        const sortingInfo = {
            sorting: {
                column: 'm1',
                direction: 'asc'
            },
            change: {
                type: 'metric'
            },
            index: 0
        };
        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                content: {
                    buckets: {
                        categories: [{
                            category: {
                                sort: null
                            }
                        },
                        {
                            category: {
                                sort: null
                            }
                        }],
                        measures: [{
                            measure: {
                                generatedId: 'm1',
                                sort: {
                                    direction: 'asc'
                                }
                            }
                        }]
                    }
                }
            });
    });

    it('should update sort info on PoP metric', () => {
        metadata.content.buckets.measures = [{
            measure: {
                generatedId: 'm1_pop'
            }
        },
        {
            measure: {
                generatedId: 'm1'
            }
        }];
        metadata.content.buckets.categories = [{
            category: {
                sort: 'asc'
            }
        },
        {
            category: {}
        }];
        const sortingInfo = {
            sorting: {
                column: 'm1_pop',
                direction: 'desc'
            },
            change: {
                type: 'metric'
            },
            index: 0
        };
        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                content: {
                    buckets: {
                        categories: [{
                            category: {
                                sort: null
                            }
                        },
                        {
                            category: {
                                sort: null
                            }
                        }],
                        measures: [{
                            measure: {
                                generatedId: 'm1_pop',
                                sort: null
                            }
                        },
                        {
                            measure: {
                                generatedId: 'm1',
                                sort: {
                                    direction: 'desc',
                                    sortByPoP: true
                                }
                            }
                        }]
                    }
                }
            });
    });

    it('should update sort info on category', () => {
        metadata.content.buckets.measures = [{
            measure: {
                generatedId: 'm1',
                sort: {
                    direction: 'asc'
                }
            }
        }];
        metadata.content.buckets.categories = [{
            category: {}
        },
        {
            category: {}
        }];

        const sortingInfo = {
            sorting: {
                direction: 'asc'
            },
            change: {
                type: 'attrLabel'
            },
            index: 1
        };
        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                content: {
                    buckets: {
                        categories: [{
                            category: {
                                sort: null
                            }
                        },
                        {
                            category: {
                                sort: 'asc'
                            }
                        }],
                        measures: [{
                            measure: {
                                generatedId: 'm1',
                                sort: null
                            }
                        }]
                    }
                }
            });
    });
});
