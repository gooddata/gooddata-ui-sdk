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
                id: 'm1',
                title: '',
                type: 'metric',
                uri: '/uri/'
            }
        };
        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                updatedMetadata:
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
                id: 'm1',
                title: '',
                type: 'metric',
                uri: '/uri/'
            }
        };
        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                updatedMetadata:
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
                },
                updatedSorting: {
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
            category: {
                displayForm: '/uri/'
            }
        }];

        const sortingInfo = {
            sorting: {
                column: '/uri/',
                direction: 'asc'
            },
            change: {
                id: 'm1',
                title: '',
                type: 'attrLabel',
                uri: '/uri/'
            }
        };
        expect(updateSorting(metadata, sortingInfo)).toEqual(
            {
                updatedMetadata:
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
                                    displayForm: '/uri/',
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
                },
                updatedSorting:
                {
                    sorting: {
                        column: '/uri/',
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
